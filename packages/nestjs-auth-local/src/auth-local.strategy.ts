import { Strategy } from 'passport-local';
import { validateOrReject } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import {
  ReferenceIdInterface,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import { PassportStrategyFactory } from '@concepta/nestjs-authentication';

import {
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_STRATEGY_NAME,
} from './auth-local.constants';

import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { AuthLocalValidateUserServiceInterface } from './interfaces/auth-local-validate-user-service.interface';
import { AuthLocalException } from './exceptions/auth-local.exception';
import { AuthLocalInvalidCredentialsException } from './exceptions/auth-local-invalid-credentials.exception';
import { AuthLocalInvalidLoginDataException } from './exceptions/auth-local-invalid-login-data.exception';
import { AuthLocalMissingLoginDtoException } from './exceptions/auth-local-missing-login-dto.exception';
import { AuthLocalMissingUsernameFieldException } from './exceptions/auth-local-missing-username-field.exception';
import { AuthLocalMissingPasswordFieldException } from './exceptions/auth-local-missing-password-field.exception';
import { AuthLocalValidateUserService } from './services/auth-local-validate-user.service';

/**
 * Define the Local strategy using passport.
 *
 * Local strategy is used to authenticate a user using a username and password.
 * The field username and password can be configured using the `usernameField` and `passwordField` properties.
 */
@Injectable()
export class AuthLocalStrategy extends PassportStrategyFactory<Strategy>(
  Strategy,
  AUTH_LOCAL_STRATEGY_NAME,
) {
  /**
   * @param settings - The settings for the local strategy
   * @param validateUserService - The service used validate passwords
   */
  constructor(
    @Inject(AUTH_LOCAL_MODULE_SETTINGS_TOKEN)
    private settings: AuthLocalSettingsInterface,
    @Inject(AuthLocalValidateUserService)
    private validateUserService: AuthLocalValidateUserServiceInterface,
  ) {
    super({
      usernameField: settings?.usernameField,
      passwordField: settings?.passwordField,
    });
  }

  /**
   * Validate the user based on the username and password
   * from the request body
   *
   * @param username - The username to authenticate
   * @param password - The plain text password
   */
  async validate(username: ReferenceUsername, password: string) {
    // break out the settings
    const { loginDto, usernameField, passwordField } = this.assertSettings();

    // validate the dto
    const dto = new loginDto();
    dto[usernameField] = username;
    dto[passwordField] = password;

    try {
      await validateOrReject(dto);
    } catch (e) {
      throw new AuthLocalInvalidLoginDataException({
        originalError: e,
      });
    }

    let validatedUser: ReferenceIdInterface;

    try {
      // try to get fully validated user
      validatedUser = await this.validateUserService.validateUser({
        username,
        password,
      });
    } catch (e) {
      // did they throw an invalid credentials exception?
      if (e instanceof AuthLocalInvalidCredentialsException) {
        // yes, use theirs
        throw e;
      } else {
        // something else went wrong
        throw new AuthLocalException({ originalError: e });
      }
    }

    // did we get a valid user?
    if (!validatedUser) {
      throw new AuthLocalInvalidCredentialsException({
        message: `Unable to validate user with username: %s`,
        messageParams: [username],
      });
    }

    return validatedUser;
  }

  /**
   * Return settings asserted as definitely defined.
   */
  protected assertSettings(): Required<AuthLocalSettingsInterface> {
    const { loginDto, usernameField, passwordField } = this.settings;

    // is the login dto missing?
    if (!loginDto) {
      throw new AuthLocalMissingLoginDtoException();
    }

    // is the username field missing?
    if (!usernameField) {
      throw new AuthLocalMissingUsernameFieldException();
    }

    // is the password field missing?
    if (!passwordField) {
      throw new AuthLocalMissingPasswordFieldException();
    }

    return { loginDto, usernameField, passwordField };
  }
}
