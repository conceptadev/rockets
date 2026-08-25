import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryIdempotencyStore } from './in-memory-idempotency-store.service';

describe('InMemoryIdempotencyStore', () => {
  let store: InMemoryIdempotencyStore;

  beforeEach(() => {
    store = new InMemoryIdempotencyStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns undefined for an unknown key', async () => {
    await expect(store.get('missing')).resolves.toBeUndefined();
  });

  it('returns what was stored', async () => {
    await store.set(
      'k1',
      { status: 201, body: { id: 1 }, requestHash: 'h1' },
      1000,
    );

    await expect(store.get('k1')).resolves.toEqual({
      status: 201,
      body: { id: 1 },
      requestHash: 'h1',
    });
  });

  it('expires an entry after its ttl elapses', async () => {
    vi.useFakeTimers();
    await store.set('k1', { status: 200, body: {}, requestHash: 'h' }, 100);

    vi.advanceTimersByTime(50);
    await expect(store.get('k1')).resolves.toBeDefined();

    vi.advanceTimersByTime(60);
    await expect(store.get('k1')).resolves.toBeUndefined();
  });
});
