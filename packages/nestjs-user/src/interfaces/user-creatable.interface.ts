import { UserInterface } from './user.interface';

export interface UserCreatableInterface
  extends Pick<UserInterface, 'username' | 'password'> {}
