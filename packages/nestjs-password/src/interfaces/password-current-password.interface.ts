import { PasswordStorageInterface } from './password-storage.interface';

export interface PasswordCurrentPasswordInterface {
  password: string;
  target: PasswordStorageInterface;
}
