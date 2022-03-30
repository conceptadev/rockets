import { IdentityUsernameInterface } from '@concepta/nestjs-common';
import { UserPasswordEncryptedInterface } from './user-password-encrypted.interface';

export interface UserCredentialsInterface
  extends IdentityUsernameInterface,
    UserPasswordEncryptedInterface {
  username: string;
}
