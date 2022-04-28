import { PasswordNewInterface } from './password-new.interface';
import { PasswordStorageInterface } from './password-storage.interface';

/**
 * Password Storage Service Interface
 */
export interface PasswordStorageServiceInterface {
  /**
   * Generate salt to be used to encrypt password.
   */
  generateSalt(): Promise<string>;

  /**
   * Encrypt a password using a salt, if not salt
   * was passed, then generate a new one before encrypt.
   *
   * @param password Password to be encrypted
   * @param salt Use salts to safeguard passwords in storage
   */
  encrypt(password: string, salt?: string): Promise<PasswordStorageInterface>;

  /**
   * Encrypt password for an object.
   *
   * @param object An object containing the new password to encrypt.
   * @param salt Optional salt. If not provided, one will be generated.
   * @returns A new object with the password encrypted, with salt added.
   */
  encryptObject<T extends PasswordNewInterface>(
    object: T,
    salt?: string,
  ): Promise<PasswordStorageInterface>;

  /**
   * Validate if password matches and its valid.
   *
   * @param passwordPlain Plain Password not encrypted
   * @param passwordCrypt Password encrypted
   * @param salt salt to be used on plain  password to see it match
   */
  validate(
    passwordPlain: string,
    passwordCrypt: string,
    salt: string,
  ): Promise<boolean>;

  /**
   * Validate password on an object.
   *
   * @param passwordPlain Plain password not encrypted
   * @param object The object on which the password and salt are stored
   */
  validateObject<T extends PasswordStorageInterface>(
    passwordPlain: string,
    object: T,
  ): Promise<boolean>;
}
