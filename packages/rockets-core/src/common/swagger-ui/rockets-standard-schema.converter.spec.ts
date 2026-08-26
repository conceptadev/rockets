import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { withOpenApi } from '@concepta/nestjs-core';
import { createRocketsStandardSchemaConverter } from './rockets-standard-schema.converter';

describe('createRocketsStandardSchemaConverter', () => {
  it('turns a named schema into a $ref and lifts nested definitions', () => {
    const convert = createRocketsStandardSchemaConverter();
    const nested = withOpenApi(z.object({ b: z.number() }), 'NestedDto');
    const outer = withOpenApi(z.object({ a: nested }), 'OuterDto');

    const result = convert(outer, { schemaType: 'output' });

    expect(result?.schema).toEqual({
      $ref: '#/components/schemas/OuterDto',
    });
    expect(result?.components).toHaveProperty('OuterDto');
    expect(result?.components).toHaveProperty('NestedDto');
  });

  it('passes an unnamed schema through', () => {
    const convert = createRocketsStandardSchemaConverter();
    expect(
      convert(withOpenApi(z.object({ a: z.string() })), {
        schemaType: 'input',
      }),
    ).toBeUndefined();
    expect(
      convert({ not: 'a schema' }, { schemaType: 'input' }),
    ).toBeUndefined();
  });

  it('rejects two different instances claiming one id', () => {
    const convert = createRocketsStandardSchemaConverter();
    convert(withOpenApi(z.object({ a: z.string() }), 'SameDto'), {
      schemaType: 'output',
    });
    expect(() =>
      convert(withOpenApi(z.object({ b: z.string() }), 'SameDto'), {
        schemaType: 'output',
      }),
    ).toThrow(/two different schema instances/);
  });

  it('accepts one instance asked for the same side twice', () => {
    const convert = createRocketsStandardSchemaConverter();
    const plain = withOpenApi(z.object({ n: z.string() }), 'PlainDto');
    convert(plain, { schemaType: 'output' });
    expect(() => convert(plain, { schemaType: 'output' })).not.toThrow();
  });

  // zod's input and output JSON Schemas differ by construction (the
  // output side is `additionalProperties: false`, defaults become
  // required, transforms change types), so one component cannot describe
  // a request and a response; last-wins would document one side with the
  // other's shape silently.
  it('rejects one instance documented as both a request and a response', () => {
    const convert = createRocketsStandardSchemaConverter();
    const dual = withOpenApi(
      z.object({ n: z.string().transform((s) => s.length) }),
      'DualDto',
    );
    convert(dual, { schemaType: 'input' });
    expect(() => convert(dual, { schemaType: 'output' })).toThrow(
      /both a request \(input\) and a response \(output\)/,
    );

    const plain = withOpenApi(z.object({ n: z.string() }), 'PlainDto');
    convert(plain, { schemaType: 'output' });
    expect(() => convert(plain, { schemaType: 'input' })).toThrow(
      /both a request \(input\) and a response \(output\)/,
    );
  });
});
