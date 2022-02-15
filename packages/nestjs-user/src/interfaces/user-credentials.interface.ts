import { UserInterface } from './user.interface';

export interface UserCredentialsInterface
  extends Pick<UserInterface, 'id' | 'username' | 'password' | 'salt'> {}
