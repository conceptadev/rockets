import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { assertFailClosedResponse } from './open-api-schema.util';

const open = z.looseObject({ a: z.string() });
const closed = z.object({ a: z.string() });

/**
 * Every node that can hold another schema must be walked: serialization
 * IS validation, so an open object anywhere in a response tree ships the
 * whole row. Each case below places the same open object one level down
 * a different wrapper.
 */
describe('assertFailClosedResponse', () => {
  const rejected: Array<[string, z.ZodType]> = [
    ['plain loose object', open],
    ['catchall', z.object({ a: z.string() }).catchall(z.unknown())],
    ['in array', z.array(open)],
    ['in union', z.union([closed, open])],
    [
      'in discriminated union',
      z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('c'), a: z.string() }),
        z.looseObject({ kind: z.literal('o'), a: z.string() }),
      ]),
    ],
    ['in intersection (right)', z.intersection(closed, open)],
    ['in intersection (left)', z.intersection(open, closed)],
    ['in record value', z.record(z.string(), open)],
    ['in map value', z.map(z.string(), open)],
    ['in set', z.set(open)],
    ['in tuple item', z.tuple([z.string(), open])],
    ['in tuple rest', z.tuple([z.string()], open)],
    ['in readonly', open.readonly()],
    ['in catch', open.catch({ a: 'x' })],
    ['in optional', open.optional()],
    ['in nullable', open.nullable()],
    ['in default', open.default({ a: 'x' })],
    ['in prefault', open.prefault({ a: 'x' })],
    ['in nonoptional', open.optional().nonoptional()],
    ['in preprocess out side', z.preprocess((v) => v, open)],
    // PR #105 review: an ordinary `.transform()` is a pipe whose object
    // sits on the IN side, and an identity transform ships whatever it
    // let through.
    ['in transform in side', open.transform((value) => value)],
    ['in pipe into any', z.pipe(open, z.any())],
    [
      'in pipe into unknown',
      // Fixture cast: zod's pipe typing is invariant on the OUT input type;
      // the runtime shape (a pass-through OUT) is what the check reads.
      z.pipe(open, z.unknown() as z.ZodType<unknown, z.output<typeof open>>),
    ],
    [
      'in pipe into custom',
      z.pipe(
        open,
        z.custom<object>(() => true) as z.ZodType<
          object,
          z.output<typeof open>
        >,
      ),
    ],
    ['in lazy', z.lazy(() => open)],
    ['nested object field', z.object({ inner: open })],
    ['deep: array of optional readonly', z.array(open.readonly().optional())],
  ];

  it.each(rejected)('rejects an open object %s', (_label, schema) => {
    expect(() => assertFailClosedResponse(schema, 'spec')).toThrow(
      /open object/,
    );
  });

  const accepted: Array<[string, z.ZodType]> = [
    ['closed object', closed],
    ['strict object', closed.strict()],
    ['record of primitives', z.record(z.string(), z.number())],
    ['array of closed', z.array(closed)],
    [
      'intersection of closed',
      z.intersection(closed, z.object({ b: z.number() })),
    ],
    ['tuple of closed', z.tuple([closed], z.string())],
    ['readonly closed', closed.readonly()],
    ['catch closed', closed.catch({ a: 'x' })],
    ['preprocess with closed out', z.preprocess((v) => v, closed)],
    // The closed `out` strips on the way out; nothing from `in` leaks.
    ['pipe from open into closed', z.pipe(open, closed)],
    [
      'recursive lazy of closed',
      z.object({
        get children() {
          return z.array(z.lazy(() => closed));
        },
      }),
    ],
  ];

  it.each(accepted)('accepts %s', (_label, schema) => {
    expect(() => assertFailClosedResponse(schema, 'spec')).not.toThrow();
  });

  it('names the path of the open node', () => {
    expect(() =>
      assertFailClosedResponse(
        z.object({ list: z.array(z.object({ deep: open }).readonly()) }),
        'spec',
      ),
    ).toThrow('"$.list[].deep"');
  });
});
