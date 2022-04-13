import {
  ReferenceEmailInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

/**
 * Credentials Interface
 */
export interface FederatedUserMutateInterface
  extends ReferenceEmailInterface, ReferenceUsernameInterface { }
