import { PasswordPlainInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from './password-storage.interface';

export interface PasswordHistoryPasswordInterface
  extends PasswordPlainInterface {
  targets: PasswordStorageInterface[];
}
