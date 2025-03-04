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
   * Check if a password meets the minimum strength requirements.
   * Uses zxcvbn to score password strength from 0-4:
   *
   * The minimum required strength can be specified via:
   * 1. The options.passwordStrength parameter - If defined it will be used as the minimum required strength
   * 2. The module settings minPasswordStrength - Global minimum strength setting
   * 3. Defaults to PasswordStrengthEnum.None (0) - If no other strength requirements specified
   *
   * @param password - The password to check
   * @param options - Optional strength validation options
   * @returns True if password meets minimum strength, false otherwise
   */
  isStrong(
    password: string,
    options?: PasswordStrengthOptionsInterface,
  ): boolean {
    const { passwordStrength } = options || {};

    const minStrength =
      passwordStrength ??
      this.settings?.minPasswordStrength ??
      PasswordStrengthEnum.None;

    // check strength of the password
    const result = zxcvbn(password);

    // Check if is strong based on configuration
    return result.score >= minStrength;
  }
}
