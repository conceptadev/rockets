import { NotAnErrorException } from '@concepta/ts-core';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class CrudQueryException extends RuntimeException {
  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: unknown,
    message = 'Error while trying to query the %s entity',
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
    this.errorCode = 'CRUD_QUERY_ERROR';
  }
}
