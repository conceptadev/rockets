import { PasswordStorageInterface } from '../../password/interfaces/password-storage.interface';
import { UserInterface } from './user.interface';

export interface UserEntityInterface
  extends UserInterface,
    PasswordStorageInterface {}
