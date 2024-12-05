import { PasswordPlainInterface } from '@concepta/nestjs-common';
import { PasswordStorageInterface } from './password-storage.interface';

export interface PasswordCurrentPasswordInterface
  extends PasswordPlainInterface {
  target: PasswordStorageInterface;
}
