import { PasswordStorageInterface } from './password-storage.interface';

/**
 * Password Storage Validation Interface
 */
export interface PasswordValidationServiceInterface {
  /**
   * Validate if password matches and its valid.
   *
   * @param options.password Plain text password
   * @param options.passwordHash Password hashed
   * @param options.passwordSalt salt to be used on plain  password to see it match
   */
  validate(options: {
    password: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<boolean>;

  /**
   * Validate password on an object.
   *
   * @param options.passwordPlain Plain text password
   * @param options.object The object on which the password and salt are stored
   */
  validateObject<T extends PasswordStorageInterface>(
    passwordPlain: string,

    object: T,
  ): Promise<boolean>;
}
