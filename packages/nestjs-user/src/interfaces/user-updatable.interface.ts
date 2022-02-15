import { UserReadableInterface } from './user-readable.interface';

export interface UserUpdatableInterface
  extends Omit<UserReadableInterface, 'id'> {}
