import { SerializeOptions } from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';

import { getStandardSchema, type StandardSchemaResponseSource } from './schema';

export interface StandardSchemaResponseOptions {
  validateOptions?: StandardSchemaV1.Options;
}

/**
 * Attaches a raw or DTO-carried schema through Nest's native
 * `@SerializeOptions({ schema })` metadata.
 */
export function StandardSchemaResponse(
  source: StandardSchemaResponseSource,
  options: StandardSchemaResponseOptions = {},
): ClassDecorator & MethodDecorator {
  return SerializeOptions({
    ...options,
    schema: getStandardSchema(source),
  });
}
