import { NotAnErrorException } from '@concepta/ts-core';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReferenceLookupException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: unknown,
    message = 'Error while trying to lookup a %s reference',
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message,
      messageParams: [entityName],
      ...options,
    });
    this.context = {
      ...super.context,
      entityName,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
    this.errorCode = 'REFERENCE_LOOKUP_ERROR';
  }
}
