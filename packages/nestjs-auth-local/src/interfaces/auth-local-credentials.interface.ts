import {
  IdentityInterface,
  IdentityUsernameInterface,
} from '@concepta/nestjs-common';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

/**
 * Credentials Interface
 */
export interface AuthLocalCredentialsInterface
  extends IdentityInterface,
    IdentityUsernameInterface,
    Pick<PasswordStorageInterface, 'password' | 'salt'> {}
