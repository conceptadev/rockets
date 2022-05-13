import {
  ReferenceEmailInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';

/**
 * Credentials Interface
 */
export interface FederatedUserMutateInterface
  extends ReferenceEmailInterface,
    ReferenceUsernameInterface {}
