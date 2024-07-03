import { Inject, Injectable } from '@nestjs/common';

import { PASSWORD_MODULE_SETTINGS_TOKEN } from '../password.constants';
import { PasswordSettingsInterface } from '../interfaces/password-settings.interface';
import { PasswordCreationServiceInterface } from '../interfaces/password-creation-service.interface';
import { PasswordStrengthService } from './password-strength.service';
import { PasswordPlainInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageService } from './password-storage.service';
import { PasswordValidationService } from './password-validation.service';
import { PasswordCreateObjectOptionsInterface } from '../interfaces/password-create-object-options.interface';
import { PasswordCurrentPasswordInterface } from '../interfaces/password-current-password.interface';
import { PasswordHistoryPasswordInterface } from '../interfaces/password-history-password.interface';

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
   * Create password for an object.
   *
   * @param object - An object containing the new password to hash.
   * @param options - Password create options.
   * @returns A new object with the password hashed, with salt added.
   */
  async createObject<T extends PasswordPlainInterface>(
    object: T,
    options?: PasswordCreateObjectOptionsInterface,
  ): Promise<Omit<T, 'password'> & PasswordStorageInterface>;

  /**
   * Create password for an object.
   *
   * @param object - An object containing the new password to hash.
   * @param options - Password create options.
   * @returns A new object with the password hashed, with salt added.
   */
  async createObject<T extends Partial<PasswordPlainInterface>>(
    object: T,
    options?: PasswordCreateObjectOptionsInterface,
  ): Promise<
    | Omit<T, 'password'>
    | (Omit<T, 'password'> & Partial<PasswordStorageInterface>)
  >;

  /**
   * Create password for an object.
   *
   * @param object - An object containing the new password to hash.
   * @param options - Password create options.
   * @returns A new object with the password hashed, with salt added.
   */
  async createObject<T extends PasswordPlainInterface>(
    object: T,
    options?: PasswordCreateObjectOptionsInterface,
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  > {
    // extract properties
    const { password } = object;

    // is the password in the object?
    if (typeof password === 'string') {
      // check strength
      if (!this.passwordStrengthService.isStrong(password)) {
        throw new Error('Password is not strong enough');
      }
    }

    // finally hash it
    return this.passwordStorageService.hashObject(object, options);
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
      return this.passwordValidationService.validateObject(password, object);
    } else {
      // settings say that current password is required?
      if (this.settings?.requireCurrentToUpdate === true) {
        // TODO: should be a password exception class
        // reqs not met, throw exception
        throw new Error('Current password is required');
      }
    }

    // valid by default
    return true;
  }

  public async validateHistory(
    options: Partial<PasswordHistoryPasswordInterface>,
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
        const isValid = await this.passwordValidationService.validateObject(
          password,
          target,
        );

        // is valid?
        if (isValid) {
          throw new Error(
            'The new password has been used too recently, please use a different password',
          );
        }
      }
    }

    // valid by default
    return true;
  }

  /**
   * Check if number of current attempt is allowed based on the amount of attempts left
   * if the number of attempts left is greater then
   *
   * @returns Number of attempts user has to try
   */
  checkAttempt(numOfAttempts = 0): boolean {
    return this.checkAttemptLeft(numOfAttempts) >= 0;
  }

  /**
   * Check number of attempts of using password
   *
   * @param numOfAttempts - number of attempts
   */
  checkAttemptLeft(numOfAttempts = 0): number {
    // Get number of max attempts allowed
    const attemptsAllowed = this.settings.maxPasswordAttempts ?? 0;

    // did it reached max
    const canAttemptMore = numOfAttempts <= attemptsAllowed;

    return canAttemptMore ? attemptsAllowed - numOfAttempts : -1;
  }
}
