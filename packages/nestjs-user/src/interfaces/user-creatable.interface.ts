import { PasswordNewInterface } from '@concepta/nestjs-password';
import { UserInterface } from './user.interface';

export interface UserCreatableInterface
  extends Pick<UserInterface, 'username' | 'email'>,
    PasswordNewInterface {}
