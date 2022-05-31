import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class FederatedCreateException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'FEDERATED_CREATE_ERROR';

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: Error,
    message = 'Error while trying create a federated',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
      originalError,
    };
  }
}
