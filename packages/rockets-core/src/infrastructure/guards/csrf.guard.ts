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

export interface CsrfGuardOptions {
  /** Same secret `generateCsrfToken` mints the client-visible token with. */
  readonly secret: string;
  /**
   * The session cookie the token is bound to — same cookie the
   * session-cookie auth adapter reads.
   */
  readonly sessionCookieName: string;
  /** Header the client echoes the token in. Defaults to `x-csrf-token`. */
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
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CSRF_GUARD_OPTIONS_TOKEN)
    private readonly options: CsrfGuardOptions,
  ) {}

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

    const headerName = this.options.headerName ?? DEFAULT_HEADER_NAME;
    const rawToken = headers[headerName];
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    if (token === undefined || token.length === 0) {
      throw new ForbiddenException(`Missing CSRF token header "${headerName}"`);
    }

    if (!verifyCsrfToken(token, sessionValue, this.options.secret)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
