import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserUpdatableInterface
  extends Pick<UserCredentialsInterface, 'password'> {}
