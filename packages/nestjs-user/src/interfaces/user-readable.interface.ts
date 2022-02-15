import { UserInterface } from './user.interface';

export interface UserReadableInterface
  extends Pick<UserInterface, 'id' | 'username'> {}
