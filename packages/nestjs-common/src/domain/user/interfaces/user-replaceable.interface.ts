import { UserInterface } from './user.interface';
import { UserCreatableInterface } from './user-creatable.interface';

export interface UserReplaceableInterface
  extends Pick<UserInterface, 'id'>,
    UserCreatableInterface {}
