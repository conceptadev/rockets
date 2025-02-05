import zxcvbn from 'zxcvbn';

import { Inject, Injectable } from '@nestjs/common';

import { PASSWORD_MODULE_SETTINGS_TOKEN } from '../password.constants';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { PasswordStrengthServiceInterface } from '../interfaces/password-strength-service.interface';
import { PasswordSettingsInterface } from '../interfaces/password-settings.interface';
import { PasswordStrengthOptionsInterface } from '../interfaces/password-strength-options.interface';

/**
 * Service to validate password strength
 */
@Injectable()
export class PasswordStrengthService
  implements PasswordStrengthServiceInterface
{
  /**
   * @param settings - Password module settings
   */
  constructor(
    @Inject(PASSWORD_MODULE_SETTINGS_TOKEN)
    protected readonly settings: PasswordSettingsInterface,
  ) {}

  /**
   * Method to check if password is strong
   *
   * @param password - the plain text password
   * @returns password strength
   */
  isStrong(
    password: string,
    options?: PasswordStrengthOptionsInterface,
  ): boolean {
    const { passwordStrength } = options || {};

    // TODO: Should we allow overriding the minimum password strength even if the provided strength is lower than the configured minimum?
    const minStrength =
      passwordStrength ||
      this.settings?.minPasswordStrength ||
      PasswordStrengthEnum.None;

    // check strength of the password
    const result = zxcvbn(password);

    // Check if is strong based on configuration
    return result.score >= minStrength;
  }
}
