import { format } from 'util';
import { ExceptionInterface, NotAnErrorException } from '@concepta/ts-core';

export class CrudQueryException extends Error implements ExceptionInterface {
  errorCode = 'CRUD_QUERY_ERROR';

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: unknown,
    message = 'Error while trying to query the %s entity',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
  }
}
