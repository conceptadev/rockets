export interface RateLimitResult {
  readonly allowed: boolean;
  readonly limit: number;
  /** Never negative — clamped at 0 once the limit is exceeded. */
  readonly remaining: number;
  /** Epoch ms when the current window resets and the count returns to 0. */
  readonly resetAt: number;
}

/**
 * Fixed-window rate-limit storage port (issue #56): one policy → route
 * binding apps register once, instead of every serious app writing its
 * own fixed-window store over `@InjectDynamicRepository` +
 * `TransactionScope` (the field report's own words for what was
 * happening in practice).
 *
 * Core ships one adapter, `InMemoryRateLimitStore`, for tests and
 * samples — in-memory, single-process. A production, multi-instance
 * deployment needs a shared backend (a dynamic-repository table, Redis)
 * behind the same interface; the dynamic-repository / `TransactionScope`
 * pattern is documented, with a real e2e proving correct `ctx` /
 * transaction forwarding (the #45 regression class this port exists to
 * not repeat), in `CONFIGURATION.md` §7c.
 *
 * Deliberately NOT a decision about what happens on a store failure —
 * `consume` throwing is exactly that failure, and `RateLimitGuard`
 * fails CLOSED on it (rejects the request) rather than letting it
 * through unlimited. A store that wants to fail open must swallow its
 * own errors and return an `allowed: true` result — an explicit choice
 * on the adapter's part, never the guard's default.
 */
export interface RateLimitStoreInterface {
  /**
   * Atomically increments the counter for `key` within a fixed window
   * of `windowMs` and reports whether this request stays within
   * `limit`. Two different `(limit, windowMs)` pairs for the SAME `key`
   * are the caller's contract to keep consistent — the store does not
   * validate that policy stays constant across calls.
   */
  consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult>;
}

/** DI token for a {@link RateLimitStoreInterface} implementation. */
export const RATE_LIMIT_STORE_TOKEN = Symbol.for(
  '@concepta/rockets-core/rate-limit-store',
);
