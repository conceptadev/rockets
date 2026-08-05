import { describe, it, expect } from 'vitest';
import type { PlainLiteralObject, Type } from '@nestjs/common';
import { z } from 'zod';
import type { SchemaEntityCompiler } from '../common';
import { auditableEntity } from './base-entity';
import { f } from './fields';
import { defineZodUserMetadata } from './zod-user-metadata';

/**
 * `defineZodUserMetadata` used to build its response DTO as
 * `compileDtoClass(schema)` — the WHOLE schema, bypassing `projectSchema`.
 * Response exposure is opt-in everywhere else, so that second projection
 * path silently leaked every userMetadata column (CWE-200). These tests
 * pin that it now shares `zodResource`'s projection.
 */
describe('defineZodUserMetadata projections', () => {
  const entityCompiler: SchemaEntityCompiler = {
    compileEntity: (_schema, options) => {
      class GeneratedEntity {}
      Object.defineProperty(GeneratedEntity, 'name', { value: options.name });
      return GeneratedEntity as Type<PlainLiteralObject>;
    },
  };

  const dtoKeys = (dto: Type<object>): string[] => {
    const schema = (dto as unknown as { schema?: z.ZodObject }).schema;
    if (schema === undefined) {
      throw new Error('expected a nestjs-zod DTO with .schema');
    }
    return Object.keys(schema.shape);
  };

  const build = (extra: Record<string, z.ZodType>) =>
    defineZodUserMetadata(
      auditableEntity({
        userId: f.string({ max: 255 }),
        ...extra,
      }) as z.ZodObject,
      { entityCompiler },
    );

  it('keeps a dto.response=false column out of the response DTO', () => {
    const config = build({
      firstName: f.string(),
      internalNote: f.string({ dto: { response: false } }),
    });

    const keys = dtoKeys(config.responseDto);
    expect(keys).toContain('firstName');
    expect(keys).not.toContain('internalNote');
  });

  it('hides a column that never opted into the response at all', () => {
    const config = build({
      firstName: f.string(),
      legacyColumn: z.string(),
    });

    expect(dtoKeys(config.responseDto)).not.toContain('legacyColumn');
  });

  it('still exposes opted-in columns and the base entity fields', () => {
    const config = build({ firstName: f.string() });

    expect(dtoKeys(config.responseDto)).toEqual(
      expect.arrayContaining(['id', 'userId', 'firstName', 'dateCreated']),
    );
  });

  it('keeps server-managed columns out of create and ownership out of update', () => {
    const config = build({ firstName: f.string() });

    const create = dtoKeys(config.createDto);
    expect(create).toContain('userId');
    expect(create).toContain('firstName');
    expect(create).not.toContain('id');
    expect(create).not.toContain('dateCreated');
    expect(create).not.toContain('version');

    const update = dtoKeys(config.updateDto);
    expect(update).toContain('firstName');
    expect(update).not.toContain('userId');
    expect(update).not.toContain('id');
  });
});
