import { PasswordPlainInterface } from '@concepta/nestjs-common';
import { PasswordHashObjectOptionsInterface } from './password-hash-object-options.interface';
import { PasswordHashOptionsInterface } from './password-hash-options.interface';
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
   * @param password - Password to be hashed
   * @param options - Hash options
   */
  hash(
    password: string,
    options?: PasswordHashOptionsInterface,
  ): Promise<PasswordStorageInterface>;

  /**
   * Hash password for an object.
   *
   * @param object - An object containing the new password to hash.
   * @param options - Hash object options
   * @returns A new object with the password hashed, with salt added.
   */
  hashObject<T extends PasswordPlainInterface>(
    object: T,
    options?: PasswordHashObjectOptionsInterface,
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  >;
}
