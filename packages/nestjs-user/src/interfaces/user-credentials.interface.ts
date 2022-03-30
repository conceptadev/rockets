import { ReferenceUsernameInterface } from '@concepta/nestjs-common';
import { UserPasswordEncryptedInterface } from './user-password-encrypted.interface';

export interface UserCredentialsInterface
  extends ReferenceUsernameInterface,
    UserPasswordEncryptedInterface {
  username: string;
}
