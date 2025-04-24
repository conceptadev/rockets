import { PasswordStorageInterface } from '@concepta/nestjs-common';
import { PasswordCurrentPasswordInterface } from './password-current-password.interface';
import { PasswordHistoryPasswordInterface } from './password-history-password.interface';
import { PasswordHashOptionsInterface } from './password-hash-options.interface';

/**
 * Password Creation Service Interface
 */
export interface PasswordCreationServiceInterface {
  /**
   * Create a password using a salt, if no
   * was passed, then generate one automatically.
   *
   * @param password - Password to be hashed
   * @param options - Hash options
   */
  create(
    password: string,
    options?: PasswordHashOptionsInterface,
  ): Promise<PasswordStorageInterface>;

  /**
   * Validate the current password for the targeted object.
   *
   * @param options - Validate current options.
   * @returns boolean
   */
  validateCurrent: (
    options: Partial<PasswordCurrentPasswordInterface>,
  ) => Promise<boolean>;

  /**
   * Validate the array of password stores to check for previous usage.
   *
   * @param options - Validate history options.
   * @returns boolean Returns true if password has NOT been used withing configured range.
   */
  validateHistory: (
    options: PasswordHistoryPasswordInterface,
  ) => Promise<boolean>;
}
