import { describe, expect, it } from 'vitest';
import { getMetadataStorage } from 'class-validator';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { allowStandardSchemaKeys } from './allow-schema-keys';

describe('allowStandardSchemaKeys', () => {
  it('stamps Allow metadata for each declared key', () => {
    class Dto extends createZodDto(
      z.object({ a: z.string(), b: z.number() }),
    ) {}
    allowStandardSchemaKeys(Dto);
    const stamped = getMetadataStorage()
      .getTargetValidationMetadatas(Dto, '', false, false)
      .map((m) => `${m.type}:${m.propertyName}`)
      .sort();
    expect(stamped).toEqual(['whitelistValidation:a', 'whitelistValidation:b']);
  });

  it('throws on a class carrying no Standard Schema', () => {
    class NotADto {}
    expect(() => allowStandardSchemaKeys(NotADto)).toThrow(
      /carries no Standard Schema/,
    );
  });

  // Fixture cast: `createZodDto`'s typing wants an object schema, but
  // the RUNTIME accepts any zod schema — which is exactly the shape a
  // consumer hits (a discriminated-union body DTO). The cast builds the
  // controlled fixture; the behaviour under test is the helper's throw.
  const unionDto = (): Parameters<typeof allowStandardSchemaKeys>[0] => {
    const union = z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('a'), a: z.string() }),
      z.object({ kind: z.literal('b'), b: z.string() }),
    ]);
    return createZodDto(
      union as unknown as Parameters<typeof createZodDto>[0],
    ) as unknown as Parameters<typeof allowStandardSchemaKeys>[0];
  };

  it('throws on a shapeless schema without explicit keys', () => {
    expect(() => allowStandardSchemaKeys(unionDto())).toThrow(
      /no introspectable shape/,
    );
  });

  // An OPEN object declares arbitrary extra keys valid; a key stamp
  // would let the whitelist strip what the schema accepts — #83's
  // silent loss reintroduced THROUGH the fix. Refuse loudly.
  it('throws on an open (catchall) object schema', () => {
    class OpenDto extends createZodDto(
      z.object({ a: z.string() }).catchall(z.string()),
    ) {}
    expect(() => allowStandardSchemaKeys(OpenDto)).toThrow(/OPEN/);
  });

  it('accepts explicit keys for shapes it cannot introspect', () => {
    expect(() =>
      allowStandardSchemaKeys(unionDto(), ['kind', 'a', 'b']),
    ).not.toThrow();
  });
});
