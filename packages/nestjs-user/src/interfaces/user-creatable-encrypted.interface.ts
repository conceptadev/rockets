import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserCreatableEncryptedInterface
  extends Pick<UserCredentialsInterface, 'username' | 'password' | 'salt'> {}
