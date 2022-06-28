import { format } from 'util';
import { ExceptionInterface, ReferenceIdInterface } from '@concepta/ts-core';

export class FederatedUserLookupException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'FEDERATED_USER_LOOKUP_ERROR';

  context: {
    entityName: string;
    user: ReferenceIdInterface;
  };

  constructor(
    entityName: string,
    user: ReferenceIdInterface,
    message = 'Error while trying find user $s',
  ) {
    super(format(message, user));
    this.context = {
      entityName,
      user,
    };
  }
}
