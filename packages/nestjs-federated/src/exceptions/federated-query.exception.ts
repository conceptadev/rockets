import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class FederatedQueryException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'FEDERATED_QUERY_ERROR';

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: Error,
    message = 'Error while trying to do a query to federated',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
      originalError,
    };
  }
}
