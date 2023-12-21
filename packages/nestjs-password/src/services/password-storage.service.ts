import { Injectable } from '@nestjs/common';
import { PasswordPlainInterface } from '@concepta/ts-common';
import { CryptUtil } from '../utils/crypt.util';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageServiceInterface } from '../interfaces/password-storage-service.interface';

/**
 * Service with functions related to password security
 */
@Injectable()
export class PasswordStorageService implements PasswordStorageServiceInterface {
  /**
   * Generate Salts to safeguard passwords in storage.
   */
  async generateSalt(): Promise<string> {
    return CryptUtil.generateSalt();
  }

  /**
   * Hash a password using a salt, if no
   * was passed, then one will be generated.
   *
   * @param password Password to be hashed
   * @param salt Optional salt. If not provided, one will be generated.
   */
  async hash(
    password: string,
    options?: {
      salt?: string;
    },
  ): Promise<PasswordStorageInterface> {
    let { salt } = options ?? {};
    if (!salt) salt = await this.generateSalt();

    return {
      passwordHash: await CryptUtil.hashPassword(password, salt),
      passwordSalt: salt,
    };
  }

  /**
   * Hash password for an object.
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @returns A new object with the password hashed, with salt added.
   */
  async hashObject<T extends PasswordPlainInterface>(
    object: T,
    options?: {
      salt?: string;
      required?: boolean;
    },
  ): Promise<Omit<T, 'password'> & PasswordStorageInterface>;

  /**
   * Hash password for an object if the password property exists.
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @returns A new object with the password hashed, with salt added.
   */
  async hashObject<T extends PasswordPlainInterface>(
    object: Partial<T>,
    options?: {
      salt?: string;
      required?: boolean;
    },
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  >;

  /**
   * Hash password for an object.
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @returns A new object with the password hashed, with salt added.
   */
  async hashObject<T extends PasswordPlainInterface>(
    object: T,
    options?: {
      salt?: string;
      required?: boolean;
    },
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  > {
    // extract password property
    const { salt, required = true } = options ?? {};
    const { password, ...safeObject } = object;

    // is the password in the object?
    if (typeof password === 'string') {
      // hash the password
      const hashed = await this.hash(password, { salt });

      // return the object with password hashed
      return {
        ...safeObject,
        ...hashed,
      };
    } else if (required === true) {
      // password is required, not good
      throw new Error(
        'Password is required for hashing, but non was provided.',
      );
    }

    return safeObject;
  }
}
