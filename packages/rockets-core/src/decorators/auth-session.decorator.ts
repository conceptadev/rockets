import { SetMetadata, type CustomDecorator } from '@nestjs/common';

/** DI/reflector key for `@AuthSession()` metadata. */
export const ROCKETS_AUTH_SESSION_TOKEN = Symbol.for(
  '@concepta/rockets-core/auth-session',
);

/**
 * `true` at the handler, `'classLevel'` when applied on the controller —
 * same sentinel shape as upstream `AuthPublic`, so a `CsrfGuard` /
 * route-audit reader written against one pattern already knows the other.
 */
export type AuthSessionMetadata = true | 'classLevel';

export interface AuthSessionOptions {
  readonly classLevel?: boolean;
}

/**
 * Marks a route (or, with `{ classLevel: true }`, every route on a
 * controller) as session-cookie authenticated rather than the default
 * bearer/"internal" assumption — issue #58's ternary route policy:
 * `public` is `AuthPublic()`, `internal` is no decorator, `session` is
 * this one.
 *
 * This does NOT change how `AuthServerGuard` authenticates the route —
 * a session-cookie `AuthAdapterInterface` in the normal adapter chain
 * does that, the same as any other adapter. What this metadata drives is
 * `CsrfGuard`: state-changing requests (`POST`/`PUT`/`PATCH`/`DELETE`) to
 * a route marked `@AuthSession()` must carry a valid CSRF token, because
 * a browser attaches cookies to a cross-site request automatically and a
 * bearer `Authorization` header never does. An "internal" (undecorated)
 * bearer route is unaffected either way — `CsrfGuard` no-ops on it.
 *
 * @example
 * ```ts
 * @AuthSession()
 * @Post('profile')
 * updateProfile(@Body() dto: UpdateProfileDto) { … }
 * ```
 */
export function AuthSession(
  options?: AuthSessionOptions,
): CustomDecorator<typeof ROCKETS_AUTH_SESSION_TOKEN> {
  const value: AuthSessionMetadata = options?.classLevel ? 'classLevel' : true;
  return SetMetadata(ROCKETS_AUTH_SESSION_TOKEN, value);
}
