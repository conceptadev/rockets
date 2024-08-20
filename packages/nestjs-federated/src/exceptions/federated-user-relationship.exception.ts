import { RuntimeException } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
export class FederatedUserRelationshipException extends RuntimeException {
  context: RuntimeException['context'] & {
    federatedId: string;
  };

  constructor(
    federatedId: string,
    message = 'Error while trying to load user relationship from federated $s',
  ) {
    super({
      message,
      messageParams: [federatedId],
      httpStatus: HttpStatus.NOT_FOUND,
    });

    this.errorCode = 'FEDERATED_USER_RELATIONSHIP_ERROR';

    this.context = {
      ...super.context,
      federatedId,
    };
  }
}
