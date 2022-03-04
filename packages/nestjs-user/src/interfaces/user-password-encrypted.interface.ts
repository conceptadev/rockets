import { UserPasswordInterface } from './user-password.interface';

export interface UserPasswordEncryptedInterface extends UserPasswordInterface {
  salt: string;
}
