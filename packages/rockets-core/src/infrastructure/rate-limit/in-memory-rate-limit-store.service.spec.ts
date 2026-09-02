import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '@nestjs/common';

import { InMemoryRateLimitStore } from './in-memory-rate-limit-store.service';

describe('InMemoryRateLimitStore', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    store = new InMemoryRateLimitStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows the first request under the limit', async () => {
    const result = await store.consume('k1', 5, 60_000);
    expect(result).toMatchObject({ allowed: true, limit: 5, remaining: 4 });
  });

  it('denies once the limit is exceeded within the same window', async () => {
    for (let i = 0; i < 5; i++) {
      await store.consume('k1', 5, 60_000);
    }
    const result = await store.consume('k1', 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('remaining never goes negative past the limit', async () => {
    for (let i = 0; i < 10; i++) {
      await store.consume('k1', 3, 60_000);
    }
    const result = await store.consume('k1', 3, 60_000);
    expect(result.remaining).toBe(0);
  });

  it('resets the count once the window elapses', async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) {
      await store.consume('k1', 5, 100);
    }
    await expect(
      store.consume('k1', 5, 100).then((r) => r.allowed),
    ).resolves.toBe(false);

    vi.advanceTimersByTime(150);

    const result = await store.consume('k1', 5, 100);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('tracks separate keys independently', async () => {
    for (let i = 0; i < 5; i++) {
      await store.consume('k1', 5, 60_000);
    }
    const other = await store.consume('k2', 5, 60_000);
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(4);
  });

  it('resetAt is windowStart + windowMs', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const result = await store.consume('k1', 5, 60_000);
    expect(result.resetAt).toBe(1_000_000 + 60_000);
  });

  // The counter key carries an attacker-supplied account field, and
  // guards run BEFORE pipes, so a public login route inserts one fresh
  // key per request. Without a bound, requests that were correctly
  // rate-limited still grow the map forever — growth INSIDE the policy,
  // which the per-IP ceiling cannot stop.
  describe('key bounds', () => {
    it('does not grow past the cap on unbounded distinct keys', async () => {
      const capped = new InMemoryRateLimitStore(50);

      for (let i = 0; i < 500; i += 1) {
        await capped.consume(`attacker-${i}`, 1000, 60_000);
      }

      expect(capped.size).toBeLessThanOrEqual(50);
    });

    it('reclaims expired keys before touching live ones', async () => {
      vi.useFakeTimers();
      const capped = new InMemoryRateLimitStore(10);

      for (let i = 0; i < 10; i += 1) {
        await capped.consume(`short-${i}`, 1000, 1_000);
      }
      vi.advanceTimersByTime(1_001);

      await capped.consume('live', 1000, 3_600_000);
      await capped.consume('live', 1000, 3_600_000);

      expect(capped.size).toBeLessThanOrEqual(10);
      // The live window survived the sweep with its count intact —
      // evicting it would silently raise the effective limit, which is
      // the failure mode the cap itself can introduce.
      expect(await capped.consume('live', 1000, 3_600_000)).toMatchObject({
        remaining: 997,
      });
    });

    it('only drops a live window at the ceiling, and says so', async () => {
      const capped = new InMemoryRateLimitStore(2);
      const warn = vi
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);

      for (let i = 0; i < 10; i += 1) {
        await capped.consume(`live-${i}`, 1000, 3_600_000);
      }

      expect(capped.size).toBeLessThanOrEqual(2);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });
});
