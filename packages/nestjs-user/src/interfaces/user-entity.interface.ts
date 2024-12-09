import { UserInterface } from '@concepta/nestjs-common';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

export interface UserEntityInterface
  extends UserInterface,
    PasswordStorageInterface {}
