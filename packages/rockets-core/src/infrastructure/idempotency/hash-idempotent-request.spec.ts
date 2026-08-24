import { describe, expect, it } from 'vitest';

import { hashIdempotentRequest } from './hash-idempotent-request';

describe('hashIdempotentRequest', () => {
  it('is stable regardless of key order', () => {
    const a = hashIdempotentRequest({ name: 'x', amount: 100 });
    const b = hashIdempotentRequest({ amount: 100, name: 'x' });

    expect(a).toBe(b);
  });

  it('differs for a different value', () => {
    const a = hashIdempotentRequest({ amount: 100 });
    const b = hashIdempotentRequest({ amount: 101 });

    expect(a).not.toBe(b);
  });

  it('is stable across nested objects and arrays regardless of key order', () => {
    const a = hashIdempotentRequest({
      items: [{ sku: 'A', qty: 1 }],
      meta: { source: 'app' },
    });
    const b = hashIdempotentRequest({
      meta: { source: 'app' },
      items: [{ qty: 1, sku: 'A' }],
    });

    expect(a).toBe(b);
  });
});
