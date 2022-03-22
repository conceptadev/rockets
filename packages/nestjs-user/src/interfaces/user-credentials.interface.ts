import { UserPasswordEncryptedInterface } from './user-password-encrypted.interface';

export interface UserCredentialsInterface
  extends UserPasswordEncryptedInterface {
  username: string;
}
