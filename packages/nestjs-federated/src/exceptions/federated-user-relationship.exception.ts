import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class FederatedUserRelationshipException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'FEDERATED_USER_RELATIONSHIP_ERROR';

  context: {
    entityName: string;
    federatedId: string;
  };

  constructor(
    entityName: string,
    federatedId: string,
    message = 'Error while trying to load user relationship from federated $s',
  ) {
    super(format(message, federatedId));
    this.context = {
      entityName,
      federatedId,
    };
  }
}
