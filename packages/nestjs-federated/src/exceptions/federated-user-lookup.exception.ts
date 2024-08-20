import { ReferenceIdInterface } from '@concepta/ts-core';
import { RuntimeException } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';

export class FederatedUserLookupException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
    user: ReferenceIdInterface;
  };

  constructor(
    entityName: string,
    user: ReferenceIdInterface,
    message = 'Error while trying find user %s',
  ) {
    super({
      message,
      messageParams: [user.id],
      httpStatus: HttpStatus.NOT_FOUND,
    });
    this.errorCode = 'FEDERATED_USER_LOOKUP_ERROR';
    this.context = {
      ...super.context,
      entityName,
      user,
    };
  }
}
