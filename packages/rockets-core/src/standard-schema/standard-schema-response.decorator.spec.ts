import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createStandardSchemaResponseDto } from './create-standard-schema-response-dto';
import { StandardSchemaResponse } from './standard-schema-response.decorator';

const CLASS_SERIALIZER_OPTIONS = 'class_serializer:options';

const ProductResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

class ProductResponseDto extends createStandardSchemaResponseDto(
  ProductResponseSchema,
) {}

describe(StandardSchemaResponse.name, () => {
  it('writes the DTO schema into Nest native serializer metadata', () => {
    class TestController {
      @StandardSchemaResponse(ProductResponseDto)
      findOne(): void {}
    }

    const metadata = Reflect.getMetadata(
      CLASS_SERIALIZER_OPTIONS,
      TestController.prototype.findOne,
    );

    expect(metadata).toEqual({
      schema: ProductResponseSchema,
    });
  });

  it('supports class-level defaults and direct schemas', () => {
    @StandardSchemaResponse(ProductResponseSchema, {
      validateOptions: {
        libraryOptions: {
          locale: 'en',
        },
      },
    })
    class TestController {}

    const metadata = Reflect.getMetadata(
      CLASS_SERIALIZER_OPTIONS,
      TestController,
    );

    expect(metadata).toEqual({
      schema: ProductResponseSchema,
      validateOptions: {
        libraryOptions: {
          locale: 'en',
        },
      },
    });
  });
});
