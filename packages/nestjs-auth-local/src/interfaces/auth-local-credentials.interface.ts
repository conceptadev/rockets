import {
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

/**
 * Credentials Interface
 */
export interface AuthLocalCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface,
    PasswordStorageInterface {}
