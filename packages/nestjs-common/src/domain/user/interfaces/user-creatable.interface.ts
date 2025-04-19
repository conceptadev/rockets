import { UserInterface } from './user.interface';
import { PasswordStorageInterface } from '../../password/interfaces/password-storage.interface';

export interface UserCreatableInterface
  extends Pick<UserInterface, 'username' | 'email'>,
    Partial<Pick<UserInterface, 'active'>>,
    Partial<PasswordStorageInterface> {}
