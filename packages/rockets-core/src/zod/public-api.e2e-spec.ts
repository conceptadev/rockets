import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import * as publicZodApi from '@concepta/rockets-core/zod';

describe('@concepta/rockets-core/zod public API', () => {
  it('exports DTO compilers that preserve declared fields during strict serialization', () => {
    const exports = publicZodApi as Record<string, unknown>;

    expect(exports).toMatchObject({
      compileDtoClass: expect.any(Function),
      namedZodDto: expect.any(Function),
    });

    const compileDtoClass = exports.compileDtoClass as (
      schema: z.ZodObject,
      name: string,
    ) => new () => object;
    const PublicDto = compileDtoClass(
      z.object({ id: z.string(), displayName: z.string() }),
      'PublicDto',
    );

    const value = plainToInstance(
      PublicDto,
      {
        id: 'user-1',
        displayName: 'Ada',
        internalOnly: 'must be stripped',
      },
      { excludeExtraneousValues: true },
    );

    expect(value).toEqual({ id: 'user-1', displayName: 'Ada' });
    expect(value).not.toHaveProperty('internalOnly');
  });

  it('exposes the schema-engine surface and none of the retired DTO helpers', () => {
    const exports = publicZodApi as Record<string, unknown>;

    expect(exports).toMatchObject({
      zodResource: expect.any(Function),
      buildResponseSchema: expect.any(Function),
      defineZodUserMetadata: expect.any(Function),
    });
    expect(publicZodApi.f.date).toEqual(expect.any(Function));
    expect(publicZodApi.f.compute).toEqual(expect.any(Function));

    for (const retired of [
      'createPaginatedDto',
      'ZodBodyValidationInterceptor',
    ]) {
      expect(exports).not.toHaveProperty(retired);
    }
  });
});
