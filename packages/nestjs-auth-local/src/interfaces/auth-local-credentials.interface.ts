import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

/**
 * Credentials Interface
 */
export interface AuthLocalCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    PasswordStorageInterface {}
