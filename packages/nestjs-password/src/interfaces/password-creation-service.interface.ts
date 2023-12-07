import { PasswordPlainInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from './password-storage.interface';

/**
 * Password Creation Service Interface
 */
export interface PasswordCreationServiceInterface {
  /**
   * Create password for an object (optionally).
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @param options.currentPassword Optional current password object to validate.
   * @returns A new object with the password hashed, with salt added.
   */
  createObject<T extends PasswordPlainInterface>(
    object: T,
    options?: {
      salt?: string;
      required?: boolean;
      currentPassword?: {
        password: string;
        object: PasswordStorageInterface;
      };
    },
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  >;

  /**
   * Check if attempt is valid
   * @returns Number of attempts user has to try
   */
  checkAttempt(numOfAttempts: number): boolean;

  /**
   * Check number of attempts of using password
   * @param numOfAttempts number of attempts
   * @returns
   */
  checkAttemptLeft(numOfAttempts: number): number;
}
