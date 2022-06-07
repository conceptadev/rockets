import { Injectable } from '@nestjs/common';
import { CryptUtil } from '../utils/crypt.util';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageServiceInterface } from '../interfaces/password-storage-service.interface';
import { PasswordPlainInterface } from '../interfaces/password-plain.interface';

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
    // hash the password
    const hashed = await this.hash(object.password, salt);

    // remove the password property
    delete (object as Partial<T>).password;

    // return the object with password hashed
    return {
      ...object,
      passwordHash: hashed.passwordHash,
      passwordSalt: hashed.passwordSalt,
    };
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
      object.passwordHash,
      object.passwordSalt,
    );
  }
}
