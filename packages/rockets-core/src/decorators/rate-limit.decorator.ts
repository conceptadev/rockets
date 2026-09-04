import {
  SetMetadata,
  type CustomDecorator,
  type ExecutionContext,
} from '@nestjs/common';

/** DI/reflector key for `@RateLimit()` metadata. */
export const ROCKETS_RATE_LIMIT_TOKEN = Symbol.for(
  '@concepta/rockets-core/rate-limit',
);

/** DI token for app-wide {@link RateLimitDefaults}. */
export const RATE_LIMIT_DEFAULTS_TOKEN = Symbol.for(
  '@concepta/rockets-core/rate-limit-defaults',
);

/** The dimension a flat `@RateLimit({ limit, windowMs })` writes to. */
export const DEFAULT_RATE_LIMIT_DIMENSION = 'default';

export interface RateLimitOptions {
  /** Requests allowed per window. */
  readonly limit: number;
  readonly windowMs: number;
  /**
   * Resolves the counter key from the request. Defaults to
   * `ip:METHOD:route` — override for per-user, per-API-key, or
   * per-tenant limiting.
   *
   * Returning SEVERAL keys counts the attempt against each of them
   * independently, all under this dimension's own limit. That is what a
   * key built from a client-chosen field needs: a login body naming
   * `username` also accepts an unknown `email`, and a single key that
   * prefers one field lets the other be rotated per request to mint a
   * fresh counter. One key per field it could have meant keeps the
   * counter for the field the route actually authenticates with.
   */
  readonly key?: (context: ExecutionContext) => string | readonly string[];
}

/**
 * Named limits enforced **together**: a request must be within every
 * dimension, and each counts against its own key.
 *
 * One limit cannot express the shape a login route needs. Keyed on the
 * account alone, an attacker locks a victim out by naming their
 * username; keyed on the IP alone, the limit collapses behind a load
 * balancer. Keying on the `(ip, account)` pair fixes both — and then
 * leaves a second hole, because rotating the account field from one
 * source resets that counter on every attempt. A coarse per-IP ceiling
 * alongside it is what closes that, and it only works if the two are
 * separate counters applied at once.
 */
export type RateLimitPolicy = Readonly<
  Record<string, RateLimitDimensionOverride>
>;

/**
 * A dimension as a ROUTE writes it: every field optional, because the
 * merge is per field over the app-wide dimension of the same name. A
 * route that only tightens `limit` keeps the dimension's `key`, and a
 * route that only swaps the `key` keeps its `limit` / `windowMs` — which
 * is the shape `/invitation-acceptance` needs and the full-object type
 * could not express. A dimension that ends up with no `limit` or
 * `windowMs` after the merge (nothing supplied one) is rejected by the
 * guard, naming the dimension.
 */
export type RateLimitDimensionOverride = Partial<RateLimitOptions>;

/**
 * App-wide dimensions, provided under {@link RATE_LIMIT_DEFAULTS_TOKEN}.
 *
 * A route's own `@RateLimit()` overrides a dimension **by name** and
 * leaves the rest in place. That is the whole point of the split: a
 * route tightening its `default` limit cannot raise — or drop — the
 * ceiling it was meant to sit under.
 */
export interface RateLimitDefaults {
  /** Turns the guard into a no-op everywhere. */
  readonly disabled?: boolean;
  readonly dimensions?: RateLimitPolicy;
}

function isFlat(
  options: RateLimitOptions | RateLimitPolicy,
): options is RateLimitOptions {
  return typeof (options as RateLimitOptions).limit === 'number';
}

/**
 * Declares rate limits on a route (or, applied to a controller, every
 * route on it) — issue #56. `RateLimitGuard` is a no-op on any route
 * with no limits at all, so registering the guard globally does not
 * change behavior for routes that never opt in.
 *
 * @example Single limit — sugar for the `default` dimension.
 * ```ts
 * @RateLimit({ limit: 10, windowMs: 60_000 })
 * @Post('login')
 * login(@Body({ schema }) body: LoginBody) { … }
 * ```
 *
 * @example Overriding one dimension of an app-wide policy.
 * ```ts
 * // The `ip` ceiling registered under RATE_LIMIT_DEFAULTS_TOKEN still
 * // applies; only `default` is tightened here.
 * @RateLimit({ default: { limit: 5, windowMs: 60_000 } })
 * ```
 */
export function RateLimit(
  options: RateLimitOptions | RateLimitPolicy,
): CustomDecorator<typeof ROCKETS_RATE_LIMIT_TOKEN> {
  const policy: RateLimitPolicy = isFlat(options)
    ? { [DEFAULT_RATE_LIMIT_DIMENSION]: options }
    : options;
  return SetMetadata(ROCKETS_RATE_LIMIT_TOKEN, policy);
}
