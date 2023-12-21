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
   * @param options.password Plain text password
   * @param options.passwordHash Password hashed
   * @param options.passwordSalt salt to be used on plain password to see it match
   */
  async validate(options: {
    password: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<boolean> {
    return CryptUtil.validatePassword(
      options.password,
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
  async validateObject<T extends PasswordStorageInterface>(
    password: string,
    object: T,
  ): Promise<boolean> {
    const { passwordHash, passwordSalt } = object;

    // hash or salt is null on object?
    if (passwordHash === null || passwordSalt === null) {
      // yep, automatic invalid
      return false;
    }

    return this.validate({
      password,
      passwordHash,
      passwordSalt,
    });
  }
}
