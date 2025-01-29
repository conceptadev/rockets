import { UserCreatableInterface } from './user-creatable.interface';
import { PasswordPlainCurrentInterface } from '../../password/interfaces/password-plain-current.interface';
import { UserRolesInterface } from './user-roles.interface';

export interface UserUpdatableInterface
  extends Partial<
      Pick<UserCreatableInterface, 'email' | 'password' | 'active'>
    >,
  Partial<PasswordPlainCurrentInterface>,
  Partial<UserRolesInterface> { }
