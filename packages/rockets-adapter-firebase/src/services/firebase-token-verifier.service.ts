import { Injectable } from '@nestjs/common';

import { FirebaseDecodedTokenInterface } from '../interfaces/firebase-decoded-token.interface';
import {
  FirebaseSessionCookieOptions,
  FirebaseSessionCookieVerifierInterface,
  FirebaseTokenVerifierInterface,
  FirebaseVerifyOptions,
} from '../interfaces/firebase-token-verifier.interface';
import { resolveFirebaseAdminAuth } from '../utils/resolve-firebase-admin-auth.util';

/**
 * Default verifier — wraps a `firebase-admin` app's auth instance.
 * Tests and advanced consumers replace it via the
 * `FIREBASE_TOKEN_VERIFIER_TOKEN` provider. Implements the session-cookie
 * capability too (issue #58) — it is only ever CALLED when an app opts
 * in via `sessionCookie` module options, so bearer-only apps see no
 * behavior change either way.
 */
@Injectable()
export class FirebaseTokenVerifierService
  implements
    FirebaseTokenVerifierInterface,
    FirebaseSessionCookieVerifierInterface
{
  constructor(private readonly firebaseApp: unknown) {}

  async verifyIdToken(
    token: string,
    options?: FirebaseVerifyOptions,
  ): Promise<FirebaseDecodedTokenInterface> {
    const decoded = await resolveFirebaseAdminAuth(
      this.firebaseApp,
    ).verifyIdToken(token, options?.checkRevoked ?? false);

    return {
      ...decoded,
      uid: decoded.uid,
      sub: decoded.uid,
    };
  }

  async verifySessionCookie(
    sessionCookie: string,
    options?: FirebaseVerifyOptions,
  ): Promise<FirebaseDecodedTokenInterface> {
    const decoded = await resolveFirebaseAdminAuth(
      this.firebaseApp,
    ).verifySessionCookie(sessionCookie, options?.checkRevoked ?? false);

    return {
      ...decoded,
      uid: decoded.uid,
      sub: decoded.uid,
    };
  }

  async createSessionCookie(
    idToken: string,
    options: FirebaseSessionCookieOptions,
  ): Promise<string> {
    return resolveFirebaseAdminAuth(this.firebaseApp).createSessionCookie(
      idToken,
      { expiresIn: options.expiresIn },
    );
  }
}
