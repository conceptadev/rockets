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
   * @param options.password Password to be hashed
   * @param options.salt  Optional salt. If not provided, one will be generated.
   */
  hash(
    password: string,
    options?: {
      salt?: string;
    },
  ): Promise<PasswordStorageInterface>;

  /**
   * Hash password for an object.
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @returns A new object with the password hashed, with salt added.
   */
  hashObject<T extends PasswordPlainInterface>(
    object: T,
    options?: {
      salt?: string;
      required?: boolean;
    },
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  >;
}
