import { Strategy } from 'passport-local';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  CredentialLookupInterface,
  GetUserServiceInterface,
  PasswordStorageService,
} from '@rockts-org/nestjs-authentication';
import {
  GET_USER_SERVICE_TOKEN,
  LOCAL_STRATEGY_MODULE_CONFIG_TOKEN,
} from './config/local-strategy.config';
import GenericPassportStrategy from '@rockts-org/nestjs-authentication/dist/generic-passport.strategy';
import { LOCAL_STRATEGY_NAME } from './constants';
import { LocalStrategyConfigOptionsInterface } from './interfaces/local-auth-config-options.interface';

/**
 * Define the Local strategy using passport
 * Local strategy is used to authenticate a user using a username and password.
 * The field username and password can be configured using the `usernameField` and `passwordField` properties.
 * after register LocalStrategy in the module, use GenericAuthGuard(LOCAL_STRATEGY_NAME) in the controller endpoint to authenticate the user.
 * 
 * 
 */
@Injectable()
export class LocalStrategy extends GenericPassportStrategy(
  Strategy,
  LOCAL_STRATEGY_NAME,
  ) {
  
  /**
   * 
   * @param userService The service used to get the user
   * @param config The configuration for the local strategy
   * @param passwordService The service used to hash and validate passwords
   */
  constructor(
    @Inject(GET_USER_SERVICE_TOKEN)
    private userService: GetUserServiceInterface<CredentialLookupInterface>,
    @Inject(LOCAL_STRATEGY_MODULE_CONFIG_TOKEN)
    private config: LocalStrategyConfigOptionsInterface,
    private passwordService: PasswordStorageService,
  ) {
    super({
      usernameField: config?.usernameField,
      passwordField: config?.passwordField,
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
    const user = await this.userService.getUser(username);

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
