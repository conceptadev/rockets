import { UserCreatableInterface } from './user-creatable.interface';
import { PasswordPlainCurrentInterface } from '../../password/interfaces/password-plain-current.interface';

export interface UserUpdatableInterface
  extends Partial<
      Pick<
        UserCreatableInterface,
        'email' | 'password' | 'active' | 'loginAttempts' | 'lastLogin'
      >
    >,
    Partial<PasswordPlainCurrentInterface> {}
