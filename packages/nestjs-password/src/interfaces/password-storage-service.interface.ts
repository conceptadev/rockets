import { PasswordPlainInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from './password-storage.interface';

/**
 * Password Storage Service Interface
 */
export interface PasswordStorageServiceInterface {
  /**
   * Generate salt to be used to hash a password.
   */
  generateSalt(): Promise<string>;

  /**
   * Hash a password using a salt, if no
   * was passed, then generate one automatically.
   *
   * @param password Password to be hashed
   * @param salt  Optional salt. If not provided, one will be generated.
   */
  hash(password: string, salt?: string): Promise<PasswordStorageInterface>;

  /**
   * Hash password for an object.
   *
   * @param object An object containing the new password to hash.
   * @param salt Optional salt. If not provided, one will be generated.
   * @returns A new object with the password hashed, with salt added.
   */
  hashObject<T extends PasswordPlainInterface>(
    object: T,
    salt?: string,
  ): Promise<Omit<T, 'password'> & PasswordStorageInterface>;

  /**
   * Hash password for an object if password property exists.
   *
   * @param object An object containing the new password to hash.
   * @param salt Optional salt. If not provided, one will be generated.
   * @returns A new object with the password hashed, with salt added.
   */
  hashObjectOptional<T extends Partial<PasswordPlainInterface>>(
    object: T,
    salt?: string,
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  >;
}
