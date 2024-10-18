import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class FederatedQueryException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: Error,
    message = 'Error while trying to do a query to federated',
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
      originalError,
    };
    this.errorCode = 'FEDERATED_QUERY_ERROR';
  }
}
