import { UserInterface } from './user.interface';
import { PasswordPlainInterface } from '../../password/interfaces/password-plain.interface';

export interface UserCreatableInterface
  extends Pick<UserInterface, 'username' | 'email'>,
    Partial<PasswordPlainInterface> {}
