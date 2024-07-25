import { PasswordPlainInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from './password-storage.interface';

export interface PasswordCurrentPasswordInterface
  extends PasswordPlainInterface {
  target: PasswordStorageInterface;
}
