import { Injectable } from '@nestjs/common';
import { CryptUtil } from '../utils/crypt.util';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordValidationServiceInterface } from '../interfaces/password-validation-service.interface';

/**
 * Service with functions related to password validation
 */
@Injectable()
export class PasswordValidationService
  implements PasswordValidationServiceInterface
{
  /**
   * Validate if password matches and its valid.
   *
   * @param options.passwordPlain Plain text password
   * @param options.passwordHash Password hashed
   * @param options.passwordSalt salt to be used on plain password to see it match
   */
  async validate(options: {
    passwordPlain: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<boolean> {
    return CryptUtil.validatePassword(
      options.passwordPlain,
      options.passwordHash,
      options.passwordSalt,
    );
  }

  /**
   * Validate password on an object.
   *
   * @param passwordPlain Plain text password
   * @param object The object on which the password and salt are stored
   */
  async validateObject<T extends PasswordStorageInterface>(options: {
    passwordPlain: string;
    object: T;
  }): Promise<boolean> {
    const { passwordPlain, object } = options;
    return this.validate({
      passwordPlain,
      passwordHash: object.passwordHash ?? '',
      passwordSalt: object.passwordSalt ?? '',
    });
  }
}
