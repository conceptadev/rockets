import { PasswordPlainInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from './password-storage.interface';
import { PasswordCurrentPasswordInterface } from './password-current-password.interface';
import { PasswordCreateObjectOptionsInterface } from './password-create-object-options.interface';

/**
 * Password Creation Service Interface
 */
export interface PasswordCreationServiceInterface {
  /**
   * Create password for an object (optionally).
   *
   * @param object - An object containing the new password to hash.
   * @param options - Password create options.
   * @returns A new object with the password hashed, with salt added.
   */
  createObject<T extends PasswordPlainInterface>(
    object: T,
    options?: PasswordCreateObjectOptionsInterface,
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  >;

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
   * Check if attempt is valid.
   *
   * @returns Number of attempts user has to try
   */
  checkAttempt(numOfAttempts: number): boolean;

  /**
   * Check number of attempts of using password
   *
   * @param numOfAttempts - number of attempts
   * @returns number of attempts left
   */
  checkAttemptLeft(numOfAttempts: number): number;
}
