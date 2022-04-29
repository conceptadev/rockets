import { UserInterface } from './user.interface';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

export interface UserEntityInterface
  extends UserInterface,
    PasswordStorageInterface {}
