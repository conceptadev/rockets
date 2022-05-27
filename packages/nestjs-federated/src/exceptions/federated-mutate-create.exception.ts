import { ReferenceMutateException } from '@concepta/typeorm-common';

export class FederatedMutateCreateUserException extends ReferenceMutateException {
  errorCode = 'FEDERATED_MUTATE_CREATE_USER_ERROR';
}
