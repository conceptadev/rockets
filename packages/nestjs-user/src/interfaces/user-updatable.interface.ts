import { UserInterface } from './user.interface';

export interface UserUpdatableInterface
  extends Pick<UserInterface, 'password'> {}
