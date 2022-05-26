import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class FederatedNotFoundException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'FEDERATED_NOT_FOUND_ERROR';

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: Error,
    message = 'Error while trying find a federated',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
      originalError,
    };
  }
}
