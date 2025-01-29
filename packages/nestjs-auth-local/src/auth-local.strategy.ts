import { PassportStrategyFactory } from '@concepta/nestjs-authentication';
import {
  ReferenceIdInterface,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import { Inject, Injectable } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { Strategy } from 'passport-local';

import {
  AUTH_LOCAL_AUTHENTICATION_TYPE,
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_VALIDATE_USER_SERVICE_TOKEN,
  AUTH_LOCAL_STRATEGY_NAME,
} from './auth-local.constants';

import { AuthLocalAuthenticatedEventAsync } from './events/auth-local-authenticated.event';
import { AuthLocalInvalidCredentialsException } from './exceptions/auth-local-invalid-credentials.exception';
import { AuthLocalInvalidLoginDataException } from './exceptions/auth-local-invalid-login-data.exception';
import { AuthLocalMissingLoginDtoException } from './exceptions/auth-local-missing-login-dto.exception';
import { AuthLocalMissingPasswordFieldException } from './exceptions/auth-local-missing-password-field.exception';
import { AuthLocalMissingUsernameFieldException } from './exceptions/auth-local-missing-username-field.exception';
import { AuthLocalException } from './exceptions/auth-local.exception';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { AuthLocalUserLookupServiceInterface } from './interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalValidateUserServiceInterface } from './interfaces/auth-local-validate-user-service.interface';
import { AuthLocalRequestInterface } from './interfaces/auth-local-request.interface';
import { RuntimeException } from '@concepta/nestjs-exception';

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
    @Inject(AUTH_LOCAL_MODULE_VALIDATE_USER_SERVICE_TOKEN)
    private validateUserService: AuthLocalValidateUserServiceInterface,
    @Inject(AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    protected readonly userLookupService: AuthLocalUserLookupServiceInterface,
  ) {
    super({
      usernameField: settings?.usernameField,
      passwordField: settings?.passwordField,
      passReqToCallback: true,
    });
  }

  /**
   * Validate the user based on the username and password
   * from the request body
   *
   * @param req - The request object
   * @param username - The username to authenticate
   * @param password - The plain text password
   * @returns A validated user with an ID if successful
   * @throws AuthLocalInvalidLoginDataException If login data validation fails
   * @throws AuthLocalInvalidCredentialsException If credentials are invalid
   * @throws AuthLocalException If another error occurs during validation
   */
  async validate(
    req: AuthLocalRequestInterface,
    username: ReferenceUsername,
    password: string,
  ) {
    // break out the settings
    const { loginDto, usernameField, passwordField } = this.assertSettings();

    // validate the dto
    const dto = new loginDto();
    dto[usernameField] = username;
    dto[passwordField] = password;

    try {
      await validateOrReject(dto);
    } catch (e) {
      const error = new AuthLocalInvalidLoginDataException({
        originalError: e,
      });

      // register failed attempt
      await this.dispatchAuthAttemptEvent(
        req,
        username,
        false,
        error.safeMessage,
      );
      throw error;
    }

    let validatedUser: ReferenceIdInterface;

    try {
      // try to get fully validated user
      validatedUser = await this.validateUserService.validateUser({
        username,
        password,
      });
    } catch (e) {
      let throwError: RuntimeException;

      if (e instanceof AuthLocalInvalidCredentialsException) {
        throwError = e;
      } else {
        throwError = new AuthLocalException({ originalError: e });
      }
      await this.dispatchAuthAttemptEvent(
        req,
        username,
        false,
        throwError.message,
      );
      throw throwError;
    }

    // did we get a valid user?
    if (!validatedUser) {
      const error = new AuthLocalInvalidCredentialsException({
        message: `Unable to validate user with username: %s`,
        messageParams: [username],
      });
      await this.dispatchAuthAttemptEvent(req, username, false, error.message);
      throw error;
    }

    await this.dispatchAuthAttemptEvent(req, username, true);
    return validatedUser;
  }

  /**
   * Return settings asserted as definitely defined.
   */
  protected assertSettings(): Required<AuthLocalSettingsInterface> {
    const { loginDto, usernameField, passwordField, maxAttempts, minAttempts } =
      this.settings;

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

    return { loginDto, usernameField, passwordField, maxAttempts, minAttempts };
  }

  /**
   * TODO: review if this should be done in a middleware instead
   * and review request with ip property.
   */
  protected async dispatchAuthAttemptEvent(
    req: AuthLocalRequestInterface,
    username: string,
    success: boolean,
    failureReason?: string | null,
  ): Promise<void> {

    const user = await this.userLookupService.byUsername(username);
    if (user) {
      const info = this.getAuthenticatedUserInfo(req);

      const failMessage = failureReason ? { failureReason } : {};
      const authenticatedEventAsync = new AuthLocalAuthenticatedEventAsync({
        userInfo: {
          userId: user.id,
          ipAddress: info.ipAddress || '',
          deviceInfo: info.deviceInfo || '',
          authType: AUTH_LOCAL_AUTHENTICATION_TYPE,
          success,
          ...failMessage,
        },
      });

      await authenticatedEventAsync.emit();
    }
  }

  // TODO: review if this is the best solution
  protected getAuthenticatedUserInfo(req: AuthLocalRequestInterface): {
    ipAddress: string;
    deviceInfo: string;
  } {
    req.headers;
    const ipAddress = req?.ip ?? '';
    const deviceInfo = req?.headers?.['user-agent'] ?? '';

    return {
      ipAddress,
      deviceInfo,
    };
  }
}
