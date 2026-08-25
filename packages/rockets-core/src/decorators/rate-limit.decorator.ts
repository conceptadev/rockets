import {
  SetMetadata,
  type CustomDecorator,
  type ExecutionContext,
} from '@nestjs/common';

/** DI/reflector key for `@RateLimit()` metadata. */
export const ROCKETS_RATE_LIMIT_TOKEN = Symbol.for(
  '@concepta/rockets-core/rate-limit',
);

export interface RateLimitOptions {
  /** Requests allowed per window. */
  readonly limit: number;
  readonly windowMs: number;
  /**
   * Resolves the counter key from the request. Defaults to
   * `ip:METHOD:route` — override for per-user, per-API-key, or
   * per-tenant limiting.
   */
  readonly key?: (context: ExecutionContext) => string;
}

/**
 * Declares a rate limit on a route (or, applied to a controller, every
 * route on it) — issue #56. `RateLimitGuard` is a no-op on any route
 * without this decorator, so registering the guard globally does not
 * change behavior for routes that never opt in.
 *
 * @example
 * ```ts
 * @RateLimit({ limit: 10, windowMs: 60_000 })
 * @Post('login')
 * login(@Body() dto: LoginDto) { … }
 * ```
 */
export function RateLimit(
  options: RateLimitOptions,
): CustomDecorator<typeof ROCKETS_RATE_LIMIT_TOKEN> {
  return SetMetadata(ROCKETS_RATE_LIMIT_TOKEN, options);
}
