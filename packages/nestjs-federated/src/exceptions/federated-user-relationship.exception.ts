import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';
import { FederatedException } from './federated.exception';

export class FederatedUserRelationshipException extends FederatedException {
  context: RuntimeException['context'] & {
    federatedId: string;
  };

  constructor(federatedId: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to load user relationship from federated %s',
      messageParams: [federatedId],
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'FEDERATED_USER_RELATIONSHIP_ERROR';

    this.context = {
      ...super.context,
      federatedId,
    };
  }
}
