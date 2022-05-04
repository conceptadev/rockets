import { PasswordPlainInterface } from '@concepta/nestjs-password';
import { UserInterface } from './user.interface';

export interface UserCreatableInterface
  extends Pick<UserInterface, 'username' | 'email'>,
    Partial<PasswordPlainInterface> {}
