import { UserInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

export interface UserEntityInterface
  extends UserInterface,
    PasswordStorageInterface {}
