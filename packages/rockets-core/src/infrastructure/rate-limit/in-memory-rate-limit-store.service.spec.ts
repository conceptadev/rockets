import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
});
