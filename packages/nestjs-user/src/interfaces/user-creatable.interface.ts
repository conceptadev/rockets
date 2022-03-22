import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserCreatableInterface
  extends Pick<UserCredentialsInterface, 'username' | 'password'> {}
