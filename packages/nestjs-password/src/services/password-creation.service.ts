import { Inject, Injectable } from '@nestjs/common';

import { PASSWORD_MODULE_SETTINGS_TOKEN } from '../password.constants';
import { PasswordSettingsInterface } from '../interfaces/password-settings.interface';
import { PasswordCreationServiceInterface } from '../interfaces/password-creation-service.interface';
import { PasswordStrengthService } from './password-strength.service';
import { PasswordPlainInterface } from '@concepta/ts-common';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageService } from './password-storage.service';
import { PasswordValidationService } from './password-validation.service';

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
    @Inject(PASSWORD_MODULE_SETTINGS_TOKEN)
    private settings: PasswordSettingsInterface,
    private passwordStorageService: PasswordStorageService,
    private passwordValidationService: PasswordValidationService,
    private passwordStrengthService: PasswordStrengthService,
  ) {}

  /**
   * Create password for an object.
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @param options.currentPassword Optional current password object to validate.
   * @returns A new object with the password hashed, with salt added.
   */
  async createObject<T extends PasswordPlainInterface>(
    object: T,
    options?: {
      salt?: string;
      required?: boolean;
      currentPassword?: {
        password: string;
        object: PasswordStorageInterface;
      };
    },
  ): Promise<Omit<T, 'password'> & PasswordStorageInterface>;

  /**
   * Create password for an object.
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @param options.currentPassword Optional current password object to validate.
   * @returns A new object with the password hashed, with salt added.
   */
  async createObject<T extends Partial<PasswordPlainInterface>>(
    object: Partial<T>,
    options?: {
      salt?: string;
      required?: boolean;
      currentPassword?: {
        password: string;
        object: PasswordStorageInterface;
      };
    },
  ): Promise<
    | Omit<T, 'password'>
    | (Omit<T, 'password'> & Partial<PasswordStorageInterface>)
  >;

  /**
   * Create password for an object.
   *
   * @param object An object containing the new password to hash.
   * @param options.salt Optional salt. If not provided, one will be generated.
   * @param options.required Set to true if password is required.
   * @param options.currentPassword Optional current password object to validate.
   * @returns A new object with the password hashed, with salt added.
   */
  async createObject<T extends PasswordPlainInterface>(
    object: T,
    options?: {
      salt?: string;
      required?: boolean;
      currentPassword?: {
        password: string;
        object: PasswordStorageInterface;
      };
    },
  ): Promise<
    Omit<T, 'password'> | (Omit<T, 'password'> & PasswordStorageInterface)
  > {
    // extract properties
    const { password } = object;
    const { currentPassword } = options ?? {};

    // is the password in the object?
    if (typeof password === 'string') {
      // maybe check current password
      if (currentPassword) {
        // call validation service
        const currentPasswordIsValid =
          await this.passwordValidationService.validateObject(
            currentPassword.password,
            currentPassword.object,
          );

        // is it valid?
        if (!currentPasswordIsValid) {
          // current password they supplied is not valid
          throw new Error('Current password that was supplied is not valid');
        }
      }

      // check strength
      if (!this.passwordStrengthService.isStrong(password)) {
        throw new Error('Password is not strong enough');
      }

      return this.passwordStorageService.hashObject(object, options);
    }

    return object;
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
    const attemptsAllowed = this.settings.maxPasswordAttempts ?? 0;

    // did it reached max
    const canAttemptMore = numOfAttempts <= attemptsAllowed;

    return canAttemptMore ? attemptsAllowed - numOfAttempts : -1;
  }
}
