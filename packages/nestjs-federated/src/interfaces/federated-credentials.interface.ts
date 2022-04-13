import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

/**
 * Credentials Interface
 */
export interface FederatedCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceEmailInterface {}
