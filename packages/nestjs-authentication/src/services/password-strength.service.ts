import zxcvbn from 'zxcvbn';

import { Inject, Injectable } from '@nestjs/common';

import { AUTHENTICATION_MODULE_CONFIG_TOKEN } from '../config/authentication.config';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { PasswordStrengthServiceInterface } from '../interfaces/password-strength-service.interface';
import { AuthenticationOptionsInterface } from '../interfaces/authentication-options.interface';

/**
 * Service to validate password strength
 */
@Injectable()
export class PasswordStrengthService
  implements PasswordStrengthServiceInterface
{
  /**
   * constructor
   * @param config
   */
  constructor(
    @Inject(AUTHENTICATION_MODULE_CONFIG_TOKEN)
    private config: AuthenticationOptionsInterface,
  ) {}

  /**
   * Method to check if password is strong
   * @param password
   * @returns password strength
   */
  isStrong(password: string): boolean {
    // Get min password Strength
    const minStrength =
      this.config?.minPasswordStrength || PasswordStrengthEnum.None;

    // check strength of the password
    const result = zxcvbn(password);

    // Check if is strong based on configuration
    return result.score >= minStrength;
  }
}
