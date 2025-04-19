import { UserInterface } from './user.interface';
import { UserCreatableInterface } from './user-creatable.interface';

export interface UserUpdatableInterface
  extends Pick<UserInterface, 'id'>,
    Partial<
      Pick<
        UserCreatableInterface,
        'email' | 'active' | 'passwordHash' | 'passwordSalt'
      >
    > {}
