import {
  HttpStatus,
  Injectable,
  StandardSchemaValidationPipe,
  type ArgumentMetadata,
  type StandardSchemaValidationPipeOptions,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import type { StandardSchemaV1 } from '@standard-schema/spec';

import { standardSchemaIssuesToDetails } from '../common/utils/standard-schema.util';
import { attachErrorDetails } from '../common/utils/validation-error-details.util';
import { getCarriedStandardSchema } from './schema';

/**
 * Adds DTO-carried schemas to Nest argument metadata, then delegates parsing
 * and error handling to Nest's native `StandardSchemaValidationPipe`.
 *
 * The details-attaching exception factory lives HERE, not in
 * `StandardSchemaModule`: the pipe is a public export and
 * `@UsePipes(new StandardSchemaDtoValidationPipe())` is ordinary Nest usage,
 * so a directly-constructed instance must produce the same structured
 * `details` as the module-registered one. A caller-supplied
 * `exceptionFactory` still wins.
 *
 * Recognition is by CARRIER, not by brand (issue #83): a bare
 * `nestjs-zod` `createZodDto` class validates identically to a
 * Rockets-branded one, and the brand-only check silently skipped it —
 * the consumer believed the pipe validated a DTO it never looked at.
 * Explicit route metadata (`metadata.schema`) still wins.
 */
@Injectable()
export class StandardSchemaDtoValidationPipe extends StandardSchemaValidationPipe {
  constructor(options?: StandardSchemaValidationPipeOptions) {
    super({
      ...options,
      ...(options?.exceptionFactory === undefined
        ? { exceptionFactory: defaultExceptionFactory(options) }
        : {}),
    });
  }

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

function defaultExceptionFactory(
  validationOptions: StandardSchemaValidationPipeOptions | undefined,
): (issues: readonly StandardSchemaV1.Issue[]) => object {
  const errorHttpStatusCode =
    validationOptions?.errorHttpStatusCode ?? HttpStatus.BAD_REQUEST;
  return (issues) => {
    const messages = issues.map((issue) => issue.message);
    const ExceptionClass = HttpErrorByCode[errorHttpStatusCode];
    const exception = new ExceptionClass(messages);
    // `HttpErrorByCode` is Nest's own status-to-exception constructor map.
    // Every value constructs an exception object; the generic Type surface
    // cannot express constructor return shape.
    return attachErrorDetails(
      exception as object,
      standardSchemaIssuesToDetails(issues),
    );
  };
}
