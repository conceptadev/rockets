import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class FederatedMutateCreateUserException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'FEDERATED_MUTATE_CREATE_USER_ERROR';

  context: {
    entityName: string;
    originalError: Error;
  };

  constructor(
    entityName: string,
    originalError: Error,
    message = 'Error while trying create a user for federated',
  ) {
    super(format(message, entityName));
    this.context = {
      entityName,
      originalError,
    };
  }
}
