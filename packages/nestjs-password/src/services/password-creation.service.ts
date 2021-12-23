import { Inject, Injectable } from '@nestjs/common';

import { PASSWORD_MODULE_CONFIG_TOKEN } from '../config/password.config';
import { PasswordOptionsInterface } from '../interfaces/password-options.interface';
import { PasswordCreationServiceInterface } from '../interfaces/password-creation-service.interface';
import { PasswordStrengthService } from './password-strength.service';

/**
 * Service with functions related to password creation
 * to check if password is strong, and the number of attempts user can do to update a password
 *
 */
@Injectable()
export class PasswordCreationService
  implements PasswordCreationServiceInterface
{
  /**
   * Constructor
   */
  constructor(
    private passwordStrengthService: PasswordStrengthService,
    @Inject(PASSWORD_MODULE_CONFIG_TOKEN)
    private config: PasswordOptionsInterface,
  ) {}

  /**
   * Check if password is strong
   * @param password
   * @returns
   */
  isStrong(password: string): boolean {
    return this.passwordStrengthService.isStrong(password);
  }

  /**
   * Check if number of current attempt is allowed based on the amount of attempts left
   * if the number of attempts left is greater then
   * @returns Number of attempts user has to try
   */
  checkAttempt(numOfAttempts = 0): boolean {
    return this.checkAttemptLeft(numOfAttempts) >= 0;
  }

  /**
   * Check number of attempts of using password
   * @param numOfAttempts number of attempts
   * @returns
   */
  checkAttemptLeft(numOfAttempts = 0): number {
    // Get number of max attempts allowed
    const attemptsAllowed = this.config.maxPasswordAttempts;

    // did it reached max
    const canAttemptMore = numOfAttempts <= attemptsAllowed;

    return canAttemptMore ? attemptsAllowed - numOfAttempts : -1;
  }
}
