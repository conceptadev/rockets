import { UserCreatableInterface } from './user-creatable.interface';

export interface UserUpdatableInterface
  extends Pick<UserCreatableInterface, 'password'> {}
