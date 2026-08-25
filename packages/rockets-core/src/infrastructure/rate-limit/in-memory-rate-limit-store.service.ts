import { Injectable } from '@nestjs/common';

import type {
  RateLimitResult,
  RateLimitStoreInterface,
} from '../../domain/interfaces/rate-limit.interface';

interface Window {
  count: number;
  readonly windowStart: number;
}

/**
 * In-process reference adapter for {@link RateLimitStoreInterface}
 * (issue #56) — in-memory, single-process, fixed-window. Correct for
 * tests and samples; a multi-instance deployment needs a shared backend
 * (a dynamic-repository table, Redis) behind the same interface — two
 * instances would each track their own count, doubling the effective
 * limit. See `CONFIGURATION.md` §7c for a shared-backend store, the
 * backends it suits, and why it is deliberately not transactional.
 */
@Injectable()
export class InMemoryRateLimitStore implements RateLimitStoreInterface {
  private readonly windows = new Map<string, Window>();

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
      ? { count: 1, windowStart: now }
      : { count: existing.count + 1, windowStart: existing.windowStart };
    this.windows.set(key, window);

    return {
      allowed: window.count <= limit,
      limit,
      remaining: Math.max(0, limit - window.count),
      resetAt: window.windowStart + windowMs,
    };
  }
}
