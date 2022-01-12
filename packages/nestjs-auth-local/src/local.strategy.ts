import { Strategy } from 'passport-local';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CredentialLookupInterface } from '@rockts-org/nestjs-authentication';
import { PasswordStorageService } from '@rockts-org/nestjs-password';
import {
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_STRATEGY_NAME,
} from './auth-local.constants';
import { PassportStrategyFactory } from '@rockts-org/nestjs-authentication';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { UserLookupService } from './services/user-lookup.service';

/**
 * Define the Local strategy using passport.
 *
 * Local strategy is used to authenticate a user using a username and password.
 * The field username and password can be configured using the `usernameField` and `passwordField` properties.
 * after register LocalStrategy in the module, use GenericAuthGuard(LOCAL_STRATEGY_NAME) in the controller endpoint to authenticate the user.
 */
@Injectable()
export class LocalStrategy extends PassportStrategyFactory(
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
    settings: AuthLocalSettingsInterface,
    private userLookupService: UserLookupService,
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
   * @param pass
   * @returns
   */
  async validate(
    username: string,
    pass: string,
  ): Promise<CredentialLookupInterface> {
    const user = await this.userLookupService.getUser(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    // validate password
    const isValid = await this.passwordService.validatePassword(
      pass,
      user.password,
      user.salt,
    );

    if (!isValid) throw new UnauthorizedException();

    return user;
  }
}
