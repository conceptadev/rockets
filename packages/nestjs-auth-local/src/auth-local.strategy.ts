import { Strategy } from 'passport-local';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CredentialLookupInterface } from '@concepta/nestjs-authentication';
import { PasswordStorageService } from '@concepta/nestjs-password';
import {
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_STRATEGY_NAME,
} from './auth-local.constants';
import { PassportStrategyFactory } from '@concepta/nestjs-authentication';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { AuthLocalUserLookupService } from './services/auth-local-user-lookup.service';
import { validateOrReject } from 'class-validator';

/**
 * Define the Local strategy using passport.
 *
 * Local strategy is used to authenticate a user using a username and password.
 * The field username and password can be configured using the `usernameField` and `passwordField` properties.
 * after register LocalStrategy in the module, use GenericAuthGuard(LOCAL_STRATEGY_NAME) in the controller endpoint to authenticate the user.
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
    private userLookupService: AuthLocalUserLookupService,
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
   * @param password
   * @returns
   */
  async validate(
    username: string,
    password: string,
  ): Promise<CredentialLookupInterface> {
    // break out the fields
    const { usernameField, passwordField } = this.settings;

    // validate the dto
    const dto = new this.settings.loginDto();
    dto[usernameField] = username;
    dto[passwordField] = password;

    try {
      await validateOrReject(dto);
    } catch (e) {
      throw new BadRequestException(e);
    }

    const user = await this.userLookupService.getUser(dto[usernameField]);

    if (!user) {
      throw new UnauthorizedException();
    }

    // validate password
    const isValid = await this.passwordService.validatePassword(
      dto[passwordField],
      user.password,
      user.salt,
    );

    if (!isValid) throw new UnauthorizedException();

    return user;
  }
}
