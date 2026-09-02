import { Inject, Injectable, Logger, Optional } from '@nestjs/common';

import type {
  RateLimitResult,
  RateLimitStoreInterface,
} from '../../domain/interfaces/rate-limit.interface';

interface Window {
  count: number;
  readonly windowStart: number;
  readonly expiresAt: number;
}

/**
 * Hard ceiling on tracked keys. Reached only under abuse: a legitimate
 * app tracks one entry per (dimension, client, route) and expires them
 * continuously.
 */
const DEFAULT_MAX_KEYS = 100_000;

/**
 * Optional DI token overriding {@link DEFAULT_MAX_KEYS}. Provide it when
 * the process has a tighter memory budget than the default assumes.
 */
export const RATE_LIMIT_MAX_KEYS_TOKEN = Symbol.for(
  '@concepta/rockets-core/rate-limit-max-keys',
);

/**
 * In-process reference adapter for {@link RateLimitStoreInterface}
 * (issue #56) — in-memory, single-process, fixed-window. Correct for
 * tests, samples and single-instance deployments; a multi-instance one
 * needs a shared backend (a dynamic-repository table, Redis) behind the
 * same interface — two instances would each track their own count,
 * doubling the effective limit. See `CONFIGURATION.md` §7c.
 *
 * **Why this store evicts, and why that is not an optimisation.** The
 * counter key is derived from the request, and on the routes this store
 * exists to protect — public login, signup, recovery, OTP — part of that
 * key is attacker-supplied (the account field). Guards run BEFORE pipes
 * in Nest, so the value reaching the key function is unvalidated and
 * bounded only by the body-parser limit. A store that never frees an
 * entry therefore turns "requests that were correctly rate-limited" into
 * permanent memory: every rejected attempt still inserts a fresh key, and
 * a coarse per-IP ceiling does not help because each admitted request
 * carries a NEW account value. Unbounded growth inside the policy is the
 * failure mode, not growth from exceeding it.
 *
 * Two bounds, both cheap:
 *
 * - **Sweep on write.** Expired windows are dropped as they are passed.
 *   Amortised, so no timer and no background task to leak in tests.
 * - **A hard key cap.** When the sweep cannot get under `maxKeys`, the
 *   OLDEST-EXPIRING entries go first. Evicting a live window resets a
 *   counter, which raises the effective limit for that key — so it is
 *   done only at the ceiling, logged once per eviction batch, and
 *   ordered so live windows are the last to go.
 *
 * A caller that must never lose a count under abuse wants a shared,
 * persistent store; that is what the port exists for.
 */
@Injectable()
export class InMemoryRateLimitStore implements RateLimitStoreInterface {
  private readonly logger = new Logger(InMemoryRateLimitStore.name);
  private readonly windows = new Map<string, Window>();

  private readonly maxKeys: number;

  // `@Optional() @Inject(token)` rather than a bare defaulted parameter:
  // a plain `maxKeys: number = …` on an `@Injectable()` makes Nest try to
  // resolve `Number` from the container and fail at boot. Direct
  // construction (`new InMemoryRateLimitStore(50)`) still works.
  constructor(
    @Optional()
    @Inject(RATE_LIMIT_MAX_KEYS_TOKEN)
    maxKeys?: number,
  ) {
    this.maxKeys = maxKeys ?? DEFAULT_MAX_KEYS;
  }

  /** Tracked keys — for tests and diagnostics. */
  get size(): number {
    return this.windows.size;
  }

  async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.windows.get(key);
    const stale =
      existing === undefined || now - existing.windowStart >= windowMs;

    const window: Window = stale
      ? { count: 1, windowStart: now, expiresAt: now + windowMs }
      : {
          count: existing.count + 1,
          windowStart: existing.windowStart,
          expiresAt: existing.windowStart + windowMs,
        };
    this.windows.set(key, window);

    this.evict(now);

    return {
      allowed: window.count <= limit,
      limit,
      remaining: Math.max(0, limit - window.count),
      resetAt: window.windowStart + windowMs,
    };
  }

  private evict(now: number): void {
    if (this.windows.size <= this.maxKeys) {
      // Under the cap: sweeping every call would be O(n) per request.
      // Expired entries are reclaimed in place by the next `consume` for
      // the same key, and by the full sweep below once the cap is hit.
      return;
    }

    for (const [key, window] of this.windows) {
      if (window.expiresAt <= now) {
        this.windows.delete(key);
      }
    }
    if (this.windows.size <= this.maxKeys) {
      return;
    }

    // Still over: drop the soonest-expiring LIVE windows. This resets
    // their counters — loud, because it means the limiter is admitting
    // more than its policy for those keys.
    const overflow = this.windows.size - this.maxKeys;
    const byExpiry = [...this.windows.entries()].sort(
      (a, b) => a[1].expiresAt - b[1].expiresAt,
    );
    for (const [key] of byExpiry.slice(0, overflow)) {
      this.windows.delete(key);
    }
    this.logger.warn(
      `Rate-limit key cap (${this.maxKeys}) reached; dropped ${overflow} live ` +
        `window(s), whose counters restart. This means unique keys are being ` +
        `created faster than they expire — use a shared, persistent store.`,
    );
  }
}
