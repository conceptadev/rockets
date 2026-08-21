import {
  Injectable,
  StandardSchemaValidationPipe,
  type ArgumentMetadata,
} from '@nestjs/common';

import { getCarriedStandardSchema } from './schema';

/**
 * Adds DTO-carried schemas to Nest argument metadata, then delegates parsing
 * and error handling to Nest's native `StandardSchemaValidationPipe`.
 *
 * Recognition is by CARRIER, not by brand (issue #83): a bare
 * `nestjs-zod` `createZodDto` class validates identically to a
 * Rockets-branded one, and the brand-only check silently skipped it —
 * the consumer believed the pipe validated a DTO it never looked at.
 * Explicit route metadata (`metadata.schema`) still wins.
 */
@Injectable()
export class StandardSchemaDtoValidationPipe extends StandardSchemaValidationPipe {
  override transform<T = unknown>(
    value: T,
    metadata: ArgumentMetadata,
  ): Promise<T> {
    const schema =
      metadata.schema ?? getCarriedStandardSchema(metadata.metatype);

    return super.transform(value, {
      ...metadata,
      ...(schema === undefined ? {} : { schema }),
    });
  }
}
