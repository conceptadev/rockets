import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserUpdatableInterface
  extends Partial<Pick<UserCredentialsInterface, 'password'>> {}
