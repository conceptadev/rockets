import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
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
    PasswordStorageInterface {}
