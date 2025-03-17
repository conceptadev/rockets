import { PasswordPlainInterface } from '@concepta/nestjs-common';
import { PasswordStorageInterface } from './password-storage.interface';

export interface PasswordHistoryPasswordInterface
  extends PasswordPlainInterface {
  targets: PasswordStorageInterface[];
}
