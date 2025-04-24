import { Inject, Injectable } from '@nestjs/common';
import { PasswordStorageInterface } from '@concepta/nestjs-common';

import { PASSWORD_MODULE_SETTINGS_TOKEN } from '../password.constants';
import { PasswordSettingsInterface } from '../interfaces/password-settings.interface';
import { PasswordCreationServiceInterface } from '../interfaces/password-creation-service.interface';
import { PasswordStrengthService } from './password-strength.service';
import { PasswordStorageService } from './password-storage.service';
import { PasswordValidationService } from './password-validation.service';
import { PasswordCurrentPasswordInterface } from '../interfaces/password-current-password.interface';
import { PasswordHistoryPasswordInterface } from '../interfaces/password-history-password.interface';
import { PasswordHashOptionsInterface } from '../interfaces/password-hash-options.interface';
import { PasswordNotStrongException } from '../exceptions/password-not-strong.exception';
import { PasswordCurrentRequiredException } from '../exceptions/password-current-required.exception';
import { PasswordUsedRecentlyException } from '../exceptions/password-used-recently.exception';

/**
 * Service with functions related to password creation
 * to check if password is strong, and the number of attempts user can do to update a password
 */
@Injectable()
export class PasswordCreationService
  implements PasswordCreationServiceInterface
{
  /**
   * Constructor
   */
  constructor(
    @Inject(PASSWORD_MODULE_SETTINGS_TOKEN)
    protected readonly settings: PasswordSettingsInterface,
    protected readonly passwordStorageService: PasswordStorageService,
    protected readonly passwordValidationService: PasswordValidationService,
    protected readonly passwordStrengthService: PasswordStrengthService,
  ) {}

  /**
   * Create a hashed password using a salt, if no
   * was passed, then generate one automatically.
   *
   * @param password - Password to be hashed
   * @param options - Hash options
   */
  create(
    password: string,
    options?: PasswordHashOptionsInterface,
  ): Promise<PasswordStorageInterface> {
    // check strength
    if (!this.passwordStrengthService.isStrong(password)) {
      throw new PasswordNotStrongException();
    }

    // hash it
    return this.passwordStorageService.hash(password, options);
  }

  public async validateCurrent(
    options: Partial<PasswordCurrentPasswordInterface>,
  ): Promise<boolean> {
    const { password, target: object } = options || {
      password: undefined,
      target: undefined,
    };

    // make sure the password is a string with some length
    if (typeof password === 'string' && password.length > 0 && object) {
      // validate it
      return this.passwordValidationService.validate({ password, ...object });
    } else {
      // settings say that current password is required?
      if (this.settings?.requireCurrentToUpdate === true) {
        // reqs not met, throw exception
        throw new PasswordCurrentRequiredException();
      }
    }

    // valid by default
    return true;
  }

  public async validateHistory(
    options: PasswordHistoryPasswordInterface,
  ): Promise<boolean> {
    const { password, targets } = options || {
      password: undefined,
      targets: [],
    };

    // make sure the password is a string with some length
    if (
      typeof password === 'string' &&
      password.length > 0 &&
      targets?.length
    ) {
      // validate each target
      for (const target of targets) {
        // check if historic password is valid
        const isValid = await this.passwordValidationService.validate({
          password,
          passwordHash: target.passwordHash,
          passwordSalt: target.passwordSalt,
        });

        // is valid?
        if (isValid) {
          throw new PasswordUsedRecentlyException();
        }
      }
    }

    // valid by default
    return true;
  }
}
