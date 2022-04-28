import { Injectable } from '@nestjs/common';

import { CryptUtil } from '../utils/crypt.util';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageServiceInterface } from '../interfaces/password-storage-service.interface';
import { PasswordNewInterface } from '../interfaces/password-new.interface';

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
   * Encrypt a password using a salt, if not salt
   * was passed, then generate a new one before encrypt.
   *
   * @param password Password to be encrypted
   * @param salt Use salts to safeguard passwords in storage
   */
  async encrypt(
    password: string,
    salt?: string,
  ): Promise<PasswordStorageInterface> {
    if (!salt) salt = await this.generateSalt();

    const passwordHash = await CryptUtil.hashPassword(password, salt);

    return {
      password: passwordHash,
      salt,
    } as PasswordStorageInterface;
  }

  /**
   * Encrypt password for an object.
   *
   * @param object An object containing the new password to encrypt.
   * @param salt Optional salt. If not provided, one will be generated.
   * @returns A new object with the password encrypted, with salt added.
   */
  async encryptObject<T extends PasswordNewInterface>(
    object: T,
    salt?: string,
  ): Promise<T & PasswordStorageInterface> {
    // encrypt the password
    const encrypted = await this.encrypt(object.newPassword, salt);

    // remove the new password property
    delete object.newPassword;

    // return the object with password encrypted
    return {
      ...object,
      password: encrypted.password,
      salt: encrypted.salt,
    };
  }

  /**
   * Validate if password matches and its valid.
   *
   * @param passwordPlain Plain Password not encrypted
   * @param passwordCrypt Password encrypted
   * @param salt salt to be used on plain password to see it match
   */
  async validate(
    passwordPlain: string,
    passwordCrypt: string,
    salt: string,
  ): Promise<boolean> {
    return CryptUtil.validatePassword(passwordPlain, passwordCrypt, salt);
  }

  /**
   * Validate password on an object.
   *
   * @param passwordPlain Plain password not encrypted
   * @param object The object on which the password and salt are stored
   */
  async validateObject<T extends PasswordStorageInterface>(
    passwordPlain: string,
    object: T,
  ): Promise<boolean> {
    // validate it
    return this.validate(passwordPlain, object.password, object.salt);
  }
}
