import { Inject, Injectable, Logger } from '@nestjs/common';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
  AuthorizedUser,
} from '@concepta/rockets-core';
import { extractCookie } from '@concepta/rockets-core';

import {
  FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
  FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN,
  FIREBASE_USER_RESOLVER_TOKEN,
} from '../constants/firebase-auth.constants';
import { FirebaseAuthException } from '../exceptions/firebase-auth.exception';
import {
  FirebaseSessionCookieInvalidException,
  FirebaseSessionCookieRevokedException,
  FirebaseTokenMissingSubjectException,
} from '../exceptions/firebase-token-invalid.exception';
import { FirebaseAuthModuleOptions } from '../interfaces/firebase-auth-options.interface';
import { FirebaseSessionCookieVerifierInterface } from '../interfaces/firebase-token-verifier.interface';
import { FirebaseUserResolverInterface } from '../interfaces/firebase-user-resolver.interface';
import { readFirebaseErrorCode } from '../utils/read-firebase-error-code.util';

export const DEFAULT_SESSION_COOKIE_NAME = '__session';

/**
 * `AuthAdapterInterface` implementation backed by a Firebase session
 * cookie (issue #58) — the "session" leg of the ternary
 * `public | internal | session` route policy, for apps whose identity is
 * Firebase but whose browser holds a cookie rather than resending a
 * bearer token.
 * Register it in the SAME `auth` chain as (or instead of)
 * `FirebaseAuthAdapter`; both can coexist, each matching only requests
 * that carry ITS credential (`matched: false` on the other's absence).
 *
 * Wire `CsrfGuard` alongside it and mark session routes `@AuthSession()`
 * — this adapter authenticates the cookie, `CsrfGuard` protects the
 * state-changing requests a browser's ambient cookie exposes that a
 * bearer header never does. See `CONFIGURATION.md` §7c.
 *
 * Only registered by `FirebaseAuthModule` when `sessionCookie` module
 * options are set — a bearer-only app that never configures it gets no
 * new adapter in its chain and no behavior change.
 */
@Injectable()
export class FirebaseSessionCookieAdapter implements AuthAdapterInterface {
  private readonly logger = new Logger(FirebaseSessionCookieAdapter.name);
  private readonly cookieName: string;
  private readonly checkRevoked: boolean;

  constructor(
    @Inject(FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN)
    private readonly verifier: FirebaseSessionCookieVerifierInterface,
    @Inject(FIREBASE_USER_RESOLVER_TOKEN)
    private readonly userResolver: FirebaseUserResolverInterface,
    @Inject(FIREBASE_AUTH_MODULE_OPTIONS_TOKEN)
    options: FirebaseAuthModuleOptions,
  ) {
    this.cookieName =
      options.sessionCookie?.cookieName ?? DEFAULT_SESSION_COOKIE_NAME;
    // Defaults to TRUE, unlike the bearer adapter's `checkRevoked`
    // (which defaults to false). Not an oversight and not symmetry for
    // its own sake: a session cookie is valid for up to 14 days where an
    // ID token expires in an hour, so skipping the revocation check —
    // the same call that catches a disabled user — leaves a revoked
    // session working for two weeks. See `FirebaseSessionCookieConfig`.
    this.checkRevoked = options.sessionCookie?.checkRevoked ?? true;
  }

  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const cookie = extractCookie(request, this.cookieName);
    if (cookie === null) return { matched: false };

    try {
      const user = await this.validateCookie(cookie);
      return { matched: true, user };
    } catch (error) {
      if (
        error instanceof FirebaseSessionCookieInvalidException ||
        error instanceof FirebaseSessionCookieRevokedException ||
        error instanceof FirebaseTokenMissingSubjectException ||
        error instanceof FirebaseAuthException
      ) {
        return { matched: true, error };
      }
      return {
        matched: true,
        error: new FirebaseSessionCookieInvalidException(),
      };
    }
  }

  private async validateCookie(cookie: string): Promise<AuthorizedUser> {
    const decoded = await this.verifyOrThrow(cookie);

    if (typeof decoded.uid !== 'string' || decoded.uid.length === 0) {
      throw new FirebaseTokenMissingSubjectException();
    }

    try {
      return await this.userResolver.resolve(decoded);
    } catch (error) {
      this.logger.error(
        `Firebase user resolver failed for uid ${decoded.uid}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      if (error instanceof FirebaseAuthException) {
        throw error;
      }
      throw new FirebaseAuthException('Firebase user resolution failed', error);
    }
  }

  private async verifyOrThrow(cookie: string) {
    try {
      return await this.verifier.verifySessionCookie(cookie, {
        checkRevoked: this.checkRevoked,
      });
    } catch (error) {
      const code = readFirebaseErrorCode(error);
      if (
        code === 'auth/session-cookie-revoked' ||
        // firebase-admin reports a DISABLED user under its own code from
        // the same revocation lookup. Both mean "this session must stop
        // working now", so both map to the revoked exception rather than
        // the generic invalid one.
        code === 'auth/user-disabled'
      ) {
        this.logger.warn(`Firebase session cookie rejected: ${code}`);
        throw new FirebaseSessionCookieRevokedException(error);
      }
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Firebase session cookie verification failed${
          code ? ` (${code})` : ''
        }: ${detail}`,
      );
      throw new FirebaseSessionCookieInvalidException(error);
    }
  }
}
