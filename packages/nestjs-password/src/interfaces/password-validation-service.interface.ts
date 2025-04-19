import { PasswordStorageInterface } from '@concepta/nestjs-common';
import { PasswordValidateOptionsInterface } from './password-validate-options.interface';

/**
 * Password Storage Validation Interface
 */
export interface PasswordValidationServiceInterface {
  /**
   * Validate if password matches and its valid.
   *
   * @param options - Validation options
   */
  validate(options: PasswordValidateOptionsInterface): Promise<boolean>;

  /**
   * Validate password on an object.
   *
   * @param passwordPlain - Plain text password
   * @param object - The object on which the password and salt are stored
   */
  validateObject<T extends PasswordStorageInterface>(
    passwordPlain: string,
    object: T,
  ): Promise<boolean>;
}
