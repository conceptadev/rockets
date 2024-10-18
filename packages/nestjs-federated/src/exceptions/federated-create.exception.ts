import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class FederatedCreateException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: Error,
    message = 'Error while trying create a federated',
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
    this.errorCode = 'FEDERATED_CREATE_ERROR';
  }
}
