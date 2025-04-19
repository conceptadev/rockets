import {
  UserInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';

export interface UserEntityInterface
  extends UserInterface,
    PasswordStorageInterface {}
