import { describe, expect, it } from 'vitest';
import { z } from 'zod';

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

  describe('values that are not plain JSON', () => {
    /**
     * The documented pattern hashes `ctx.input` — the value AFTER
     * validation, where a `z.coerce.date()` field is a real `Date`. The
     * generic-object branch used to swallow it (`Object.keys(date)` is
     * `[]`), so two different dates hashed identically and a repeat
     * request under the same idempotency key replayed the WRONG stored
     * response. This is that exact scenario.
     */
    it('distinguishes two requests that differ only by a coerced Date field', () => {
      const schema = z.object({
        sku: z.string(),
        scheduledAt: z.coerce.date(),
      });

      const january = schema.parse({ sku: 'W', scheduledAt: '2026-01-01' });
      const december = schema.parse({ sku: 'W', scheduledAt: '2030-12-31' });

      expect(january.scheduledAt).toBeInstanceOf(Date);
      expect(hashIdempotentRequest(january)).not.toBe(
        hashIdempotentRequest(december),
      );
    });

    it('hashes equal Dates equally', () => {
      expect(hashIdempotentRequest({ at: new Date('2026-01-01') })).toBe(
        hashIdempotentRequest({ at: new Date('2026-01-01') }),
      );
    });

    it('distinguishes Maps and Sets with different contents', () => {
      expect(hashIdempotentRequest({ m: new Map([['a', 1]]) })).not.toBe(
        hashIdempotentRequest({ m: new Map([['a', 2]]) }),
      );
      expect(hashIdempotentRequest({ s: new Set([1, 2]) })).not.toBe(
        hashIdempotentRequest({ s: new Set([1, 3]) }),
      );
    });

    it('ignores Map and Set ordering, which is not part of the value', () => {
      expect(
        hashIdempotentRequest({
          m: new Map([
            ['a', 1],
            ['b', 2],
          ]),
        }),
      ).toBe(
        hashIdempotentRequest({
          m: new Map([
            ['b', 2],
            ['a', 1],
          ]),
        }),
      );
      expect(hashIdempotentRequest({ s: new Set([1, 2]) })).toBe(
        hashIdempotentRequest({ s: new Set([2, 1]) }),
      );
    });

    it('distinguishes bigints from the number and string with the same digits', () => {
      const asBigint = hashIdempotentRequest({ n: BigInt(1) });

      expect(asBigint).not.toBe(hashIdempotentRequest({ n: 1 }));
      expect(asBigint).not.toBe(hashIdempotentRequest({ n: '1' }));
    });

    /**
     * `JSON.stringify` drops an undefined-valued key, so both objects
     * are the SAME body on the wire — hashing them differently 409'd a
     * legitimate retry.
     */
    it('treats an undefined-valued key as absent, like JSON does', () => {
      expect(hashIdempotentRequest({ a: 1 })).toBe(
        hashIdempotentRequest({ a: 1, b: undefined }),
      );
    });

    /**
     * Untagged, a `Date` and the ISO STRING of that same date hashed
     * identically — the same collision class as the original `{}` bug,
     * one layer down. A schema accepting either spelling of a field
     * could not tell the two requests apart.
     */
    it('distinguishes a toJSON value from its plain JSON counterpart', () => {
      const iso = '2020-01-01T00:00:00.000Z';

      expect(hashIdempotentRequest({ w: new Date(iso) })).not.toBe(
        hashIdempotentRequest({ w: iso }),
      );
      expect(hashIdempotentRequest({ b: Buffer.from([1, 2]) })).not.toBe(
        hashIdempotentRequest({ b: { type: 'Buffer', data: [1, 2] } }),
      );
    });

    /**
     * An unbounded recursive walker answers a deeply nested body with a
     * `RangeError` — a 500 from a stack overflow on a value the client
     * controls, wherever the schema admits free-form JSON.
     */
    it('rejects a too-deeply-nested value with a named error, not a stack overflow', () => {
      let deep: unknown = 1;
      for (let i = 0; i < 5000; i += 1) deep = { deep };

      expect(() => hashIdempotentRequest(deep)).toThrow(/nested deeper than/);
    });

    it('still hashes ordinary nesting well past any real request body', () => {
      let nested: unknown = 1;
      for (let i = 0; i < 100; i += 1) nested = { nested };

      expect(() => hashIdempotentRequest(nested)).not.toThrow();
    });

    it('reports a circular reference instead of overflowing', () => {
      const cyclic: Record<string, unknown> = { a: 1 };
      cyclic.self = cyclic;

      expect(() => hashIdempotentRequest(cyclic)).toThrow(/circular reference/);
    });

    /**
     * A cycle is one object on its OWN branch — the same object in two
     * sibling positions is an ordinary body and must still hash.
     */
    it('allows the same object reused in sibling positions', () => {
      const shared = { id: 'x' };

      expect(() =>
        hashIdempotentRequest({ a: shared, b: shared }),
      ).not.toThrow();
    });

    it('throws rather than silently collapsing a value it cannot represent', () => {
      class Money {
        constructor(readonly cents: number) {}
      }

      expect(() => hashIdempotentRequest({ price: new Money(1) })).toThrow(
        /cannot hash a Money instance at "\$\.price"/,
      );
      expect(() => hashIdempotentRequest({ fn: () => 1 })).toThrow(
        /cannot hash a function/,
      );
      expect(() => hashIdempotentRequest({ n: Number.NaN })).toThrow(
        /non-finite number/,
      );
      expect(() => hashIdempotentRequest(undefined)).toThrow(
        /cannot hash undefined/,
      );
    });
  });
});
