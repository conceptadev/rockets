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
    salt?: string,
  ): Promise<PasswordStorageInterface> {
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
   * @param salt Optional salt. If not provided, one will be generated.
   * @returns A new object with the password hashed, with salt added.
   */
  async hashObject<T extends PasswordPlainInterface>(
    object: T,
    salt?: string,
  ): Promise<Omit<T, 'password'> & PasswordStorageInterface> {
    // extract password property
    const { password, ...safeObject } = object;

    // hash the password
    const hashed = await this.hash(password, salt);

    // return the object with password hashed
    return {
      ...safeObject,
      ...hashed,
    };
  }

  /**
   * Hash password for an object if password property exists.
   *
   * @param object An object containing the new password to hash.
   * @param salt Optional salt. If not provided, one will be generated.
   * @returns A new object with the password hashed, with salt added.
   */
  async hashObjectOptional<T extends Partial<PasswordPlainInterface>>(
    object: T,
    salt?: string,
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  > {
    // extract password property
    const { password, ...safeObject } = object;

    // is the password in the object?
    if (typeof password === 'string') {
      // hash the password
      const hashed = await this.hash(password, salt);

      // return the object with password hashed
      return {
        ...safeObject,
        ...hashed,
      };
    } else {
      return safeObject;
    }
  }

  /**
   * Validate if password matches and its valid.
   *
   * @param passwordPlain Plain text password
   * @param passwordHash Password hashed
   * @param passwordSalt salt to be used on plain password to see it match
   */
  async validate(
    passwordPlain: string,
    passwordHash: string,
    passwordSalt: string,
  ): Promise<boolean> {
    return CryptUtil.validatePassword(
      passwordPlain,
      passwordHash,
      passwordSalt,
    );
  }

  /**
   * Validate password on an object.
   *
   * @param passwordPlain Plain text password
   * @param object The object on which the password and salt are stored
   */
  async validateObject<T extends PasswordStorageInterface>(
    passwordPlain: string,
    object: T,
  ): Promise<boolean> {
    return this.validate(
      passwordPlain,
      object.passwordHash ?? '',
      object.passwordSalt ?? '',
    );
  }
}
