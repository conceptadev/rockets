import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceLockStatusInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

/**
 * Credentials Interface
 */
export interface AuthLocalCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    ReferenceLockStatusInterface,
    PasswordStorageInterface {}
