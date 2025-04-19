import { Injectable } from '@nestjs/common';
import { PasswordStorageInterface } from '@concepta/nestjs-common';
import { CryptUtil } from '../utils/crypt.util';
import { PasswordValidationServiceInterface } from '../interfaces/password-validation-service.interface';
import { PasswordValidateOptionsInterface } from '../interfaces/password-validate-options.interface';

/**
 * Service with functions related to password validation
 */
@Injectable()
export class PasswordValidationService
  implements PasswordValidationServiceInterface
{
  /**
   * {@inheritDoc PasswordValidationServiceInterface.validate}
   */
  async validate(options: PasswordValidateOptionsInterface): Promise<boolean> {
    return CryptUtil.validatePassword(
      options.password,
      options.passwordHash,
      options.passwordSalt,
    );
  }

  /**
   * {@inheritDoc PasswordValidationServiceInterface.validateObject}
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
