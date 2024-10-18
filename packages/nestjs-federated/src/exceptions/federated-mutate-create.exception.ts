import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { ReferenceMutateException } from '@concepta/typeorm-common';

export class FederatedMutateCreateUserException extends ReferenceMutateException {
  constructor(
    entityName: string,
    originalError: unknown,
    message = 'Error while trying to mutate a %s reference',
    options?: RuntimeExceptionOptions,
  ) {
    super(entityName, originalError, message, options);
    this.errorCode = 'FEDERATED_MUTATE_CREATE_USER_ERROR';
  }
}
