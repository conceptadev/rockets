import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserInterface
  extends Pick<UserCredentialsInterface, 'username'> {
  id: string;
}
