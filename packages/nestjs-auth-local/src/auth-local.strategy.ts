import { Strategy } from 'passport-local';
import { validateOrReject } from 'class-validator';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ReferenceUsername } from '@concepta/ts-core';
import { PassportStrategyFactory } from '@concepta/nestjs-authentication';
import { PasswordStorageService } from '@concepta/nestjs-password';
import {
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_LOCAL_STRATEGY_NAME,
} from './auth-local.constants';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { AuthLocalUserLookupServiceInterface } from './interfaces/auth-local-user-lookup-service.interface';

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
   *
   * @param userLookupService The service used to get the user
   * @param settings The settings for the local strategy
   * @param passwordService The service used to hash and validate passwords
   */
  constructor(
    @Inject(AUTH_LOCAL_MODULE_SETTINGS_TOKEN)
    private settings: AuthLocalSettingsInterface,
    @Inject(AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private userLookupService: AuthLocalUserLookupServiceInterface,
    private passwordService: PasswordStorageService,
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
   * @param username The username to authenticate
   * @param password The plain text password
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
      throw new BadRequestException(e);
    }

    const user = await this.userLookupService.byUsername(dto[usernameField]);

    if (!user) {
      throw new UnauthorizedException();
    }

    // validate password
    const isValid = await this.passwordService.validateObject(
      dto[passwordField],
      user,
    );

    if (!isValid) throw new UnauthorizedException();

    return user;
  }

  /**
   * Return settings asserted as definitely defined.
   */
  protected assertSettings(): Required<AuthLocalSettingsInterface> {
    const { loginDto, usernameField, passwordField } = this.settings;

    // is the login dto missing?
    if (!loginDto) {
      throw new Error('Login DTO is required, did someone remove the default?');
    }

    // is the username field missing?
    if (!usernameField) {
      throw new Error(
        'Login username field is required, did someone remove the default?',
      );
    }

    // is the password field missing?
    if (!passwordField) {
      throw new Error(
        'Login password field is required, did someone remove the default?',
      );
    }

    return { loginDto, usernameField, passwordField };
  }
}
