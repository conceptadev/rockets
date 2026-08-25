import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  ROCKETS_AUTH_SESSION_TOKEN,
  type AuthSessionMetadata,
} from '../../decorators/auth-session.decorator';
import { parseCookies } from '../auth/parse-cookies';
import { verifyCsrfToken } from '../auth/csrf-token';
import { CSRF_GUARD_OPTIONS_TOKEN } from '../../rockets-core.constants';

const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_HEADER_NAME = 'x-csrf-token';

/**
 * Shortest `secret` the guard will boot with, in CHARACTERS
 * (`String.length`, i.e. UTF-16 code units — not bytes, and not an
 * entropy measurement).
 *
 * It is a floor, not a strength check: `'a'.repeat(32)` passes and is
 * still a terrible secret. What the floor buys is catching the
 * configurations that are obviously broken — unset, empty, or a short
 * human-typed literal — at boot instead of never. 32 matches the
 * HMAC-SHA256 output size as a round, defensible lower bound; the docs
 * recommend `openssl rand -hex 32` (64 characters), which is what
 * actually supplies the entropy this construction depends on.
 */
export const MIN_CSRF_SECRET_LENGTH = 32;

export interface CsrfGuardOptions {
  /** Same secret `generateCsrfToken` mints the client-visible token with. */
  readonly secret: string;
  /**
   * The session cookie the token is bound to — same cookie the
   * session-cookie auth adapter reads.
   */
  readonly sessionCookieName: string;
  /**
   * Header the client echoes the token in. Defaults to `x-csrf-token`.
   *
   * Case-insensitive: HTTP header names are, and Node lower-cases every
   * inbound one, so `'X-CSRF-Token'` and `'x-csrf-token'` configure the
   * same header.
   */
  readonly headerName?: string;
}

/**
 * Structural view of the native request — avoids coupling core to a
 * specific HTTP adapter.
 */
interface NativeRequest {
  readonly method?: string;
  readonly headers?: Readonly<Record<string, string | string[] | undefined>>;
}

/**
 * Enforces the CSRF double-submit check on routes marked `@AuthSession()`
 * (issue #58) — everything else is a no-op, so a bearer-only app that
 * never uses `@AuthSession()` is completely unaffected by registering
 * this guard.
 *
 * Register it ALONGSIDE `AuthServerGuard`, not instead of it — this guard
 * does not authenticate anything; it only rejects a state-changing
 * request on a session route that lacks a valid token. `GET`/`HEAD`/
 * `OPTIONS` are exempt on every route (per OWASP guidance: CSRF is a
 * state-change attack, a safe method has nothing to protect).
 *
 * The options are validated in the CONSTRUCTOR, so a misconfigured
 * deployment fails at boot rather than on the first protected request —
 * an absent `secret` used to surface as a 500 the first time someone
 * POSTed to a session route, and an empty one silently produced a
 * working-but-worthless HMAC that never failed at all.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  /** Header name as CONFIGURED — used in error messages. */
  private readonly headerName: string;
  /**
   * The same name lower-cased, which is the only form that ever appears
   * as a key on `request.headers`: Node lower-cases every inbound header
   * name. Reading `headers[headerName]` verbatim meant a perfectly
   * conventional `headerName: 'X-CSRF-Token'` matched nothing and
   * rejected EVERY state-changing session request.
   */
  private readonly headerLookup: string;

  constructor(
    private readonly reflector: Reflector,
    @Inject(CSRF_GUARD_OPTIONS_TOKEN)
    private readonly options: CsrfGuardOptions,
  ) {
    assertUsableSecret(options.secret);

    if (
      typeof options.sessionCookieName !== 'string' ||
      options.sessionCookieName.length === 0
    ) {
      throw new Error(
        'CsrfGuard: `sessionCookieName` is required — it names the cookie ' +
          'the CSRF token is bound to, and there is no safe default.',
      );
    }

    this.headerName = options.headerName ?? DEFAULT_HEADER_NAME;
    this.headerLookup = this.headerName.toLowerCase();
  }

  canActivate(context: ExecutionContext): boolean {
    const sessionMeta = this.reflector.getAllAndOverride<AuthSessionMetadata>(
      ROCKETS_AUTH_SESSION_TOKEN,
      [context.getHandler(), context.getClass()],
    );
    if (sessionMeta !== true && sessionMeta !== 'classLevel') {
      return true;
    }

    const request = context.switchToHttp().getRequest<NativeRequest>();
    const method = (request.method ?? 'GET').toUpperCase();
    if (SAFE_METHODS.has(method)) {
      return true;
    }

    const headers = request.headers ?? {};
    const cookies = parseCookies(headers['cookie']);
    const sessionValue = cookies[this.options.sessionCookieName];
    if (sessionValue === undefined) {
      // No session cookie at all — the session-cookie auth adapter will
      // already reject this request as unauthenticated; failing CSRF
      // first still communicates the right thing (no session to protect).
      throw new ForbiddenException('Missing session cookie');
    }

    const rawToken = headers[this.headerLookup];
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    if (token === undefined || token.length === 0) {
      throw new ForbiddenException(
        `Missing CSRF token header "${this.headerName}"`,
      );
    }

    if (!verifyCsrfToken(token, sessionValue, this.options.secret)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

/**
 * Fails the boot on a secret that cannot do the job.
 *
 * `undefined` is the `process.env.CSRF_SECRET!` that was never set — the
 * non-null assertion makes it a compile-time non-problem and a runtime
 * one. `''` is worse: it is a legal HMAC key, so nothing anywhere throws
 * and the deployment runs with CSRF tokens anyone can compute.
 */
function assertUsableSecret(secret: string): void {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error(
      'CsrfGuard: `secret` is required and must be a non-empty string. ' +
        'An unset or empty secret still produces a valid-looking HMAC, so ' +
        'every CSRF token becomes forgeable by anyone who knows the ' +
        'session cookie value — the exact attack this guard exists to ' +
        'stop. Set it from configuration (e.g. `process.env.CSRF_SECRET`) ' +
        'and fail your own config load when that is missing.',
    );
  }

  if (secret.length < MIN_CSRF_SECRET_LENGTH) {
    throw new Error(
      `CsrfGuard: \`secret\` must be at least ${MIN_CSRF_SECRET_LENGTH} ` +
        `characters (got ${secret.length}). This is a length floor, not a ` +
        'strength check — it catches unset and hand-typed secrets, it ' +
        'cannot tell you a long one is random. The token is ' +
        'HMAC-SHA256(secret, sessionValue), so a guessable secret lets an ' +
        'attacker mint tokens for any session value they can observe: use ' +
        'a high-entropy value, e.g. `openssl rand -hex 32`.',
    );
  }
}
