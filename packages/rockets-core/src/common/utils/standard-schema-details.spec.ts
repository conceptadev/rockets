import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { standardSchemaIssuesToDetails } from './standard-schema.util';

const issuesOf = (schema: z.ZodType, value: unknown) => {
  const parsed = schema.safeParse(value);
  if (parsed.success) throw new Error('expected failure');
  return parsed.error.issues;
};

describe('standardSchemaIssuesToDetails', () => {
  // Synthetic issue: zod cannot produce all-non-string keys, but the
  // guard must not turn the finding into a silent [] subset.
  it('falls through to the plain issue when no key is a string', () => {
    const details = standardSchemaIssuesToDetails([
      {
        code: 'unrecognized_keys',
        keys: [1, Symbol('x')],
        path: [],
        message: 'Unrecognized keys',
      } as unknown as Parameters<
        typeof standardSchemaIssuesToDetails
      >[0][number],
    ]);
    expect(details).toEqual([{ path: [], message: 'Unrecognized keys' }]);
  });

  it('keeps numeric path segments as numbers — index 0 is not key "0"', () => {
    const details = standardSchemaIssuesToDetails(
      issuesOf(z.object({ tags: z.array(z.string()) }), { tags: [1] }),
    );
    expect(details).toEqual([expect.objectContaining({ path: ['tags', 0] })]);
  });

  // zod reports every unrecognized key in ONE issue with `path: []` —
  // useless for a client highlighting a field. One detail per key,
  // addressed AT the key.
  it('fans unrecognized keys out into one addressed detail each', () => {
    const details = standardSchemaIssuesToDetails(
      issuesOf(z.object({ a: z.string() }).strict(), {
        a: 'x',
        bogus: 1,
        extra: 2,
      }),
    );
    expect(details).toEqual([
      { path: ['bogus'], message: 'Unrecognized key: "bogus"' },
      { path: ['extra'], message: 'Unrecognized key: "extra"' },
    ]);
  });

  // With ONE unrecognized key the issue's own message IS the per-key
  // message — a localized zod keeps its wording instead of gaining an
  // un-localized twin.
  it('keeps the issue message verbatim for a single unrecognized key', () => {
    const details = standardSchemaIssuesToDetails(
      issuesOf(z.object({ a: z.string() }).strict(), { a: 'x', bogus: 1 }),
    );
    expect(details).toEqual([
      { path: ['bogus'], message: 'Unrecognized key: "bogus"' },
    ]);
  });

  it('addresses unrecognized keys under a NESTED strict object', () => {
    const details = standardSchemaIssuesToDetails(
      issuesOf(z.object({ nested: z.object({ a: z.string() }).strict() }), {
        nested: { a: 'x', bogus: 1 },
      }),
    );
    expect(details).toEqual([
      expect.objectContaining({ path: ['nested', 'bogus'] }),
    ]);
  });

  it('passes ordinary issues through with their path and message', () => {
    const details = standardSchemaIssuesToDetails(
      issuesOf(z.object({ nested: z.object({ a: z.string() }) }), {
        nested: {},
      }),
    );
    expect(details).toEqual([
      expect.objectContaining({
        path: ['nested', 'a'],
        message: expect.stringContaining('expected string'),
      }),
    ]);
  });
});
