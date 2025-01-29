import { UserInterface } from './user.interface';
import { PasswordPlainInterface } from '../../password/interfaces/password-plain.interface';
import { UserRolesInterface } from './user-roles.interface';

export interface UserCreatableInterface
  extends Pick<UserInterface, 'username' | 'email'>,
    Partial<Pick<UserInterface, 'active'>>,
    Partial<PasswordPlainInterface>,
    Partial<UserRolesInterface> { }
