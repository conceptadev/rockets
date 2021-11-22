import { IVerifyOptions, Strategy } from 'passport-local';

import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  GetUserServiceInterface,
  IssueTokenServiceInterface,
  PasswordStorageService,
  AuthenticationService,
  AuthenticationResponseInterface,
} from '@rockts-org/nestjs-authentication';

import { LOCAL_STRATEGY_NAME } from './constants';

/**
 * Use this service to authenticate using middleware instead of authGuard
 */
@Injectable()
export class LocalStrategyService implements OnModuleInit {
  constructor(
    private authenticationService: AuthenticationService,
    private userService: GetUserServiceInterface,
    private passwordService: PasswordStorageService,
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Initialize the strategy
   */
  onModuleInit() {
    // Create a Local Strategy manually
    const localStrategy = new Strategy(this.validate);

    // authentication Service will make sure this runs for express or fastify
    this.authenticationService.use(LOCAL_STRATEGY_NAME, localStrategy);
  }

  /**
   * Validate Username and password and return the user
   * user will be added to the Request.user property
   * @param username
   * @param pass
   * @param done
   * @returns
   */
  async validate(
    username: string,
    pass: string,
    done: (
      error: unknown,
      user?: AuthenticationResponseInterface,
      options?: IVerifyOptions,
    ) => void,
  ): Promise<unknown> {
    try {
      const user = await this.userService.getUser(username);
      if (!user) {
        return done(null, null);
      }

      const isValid = await this.passwordService.validatePassword(
        pass,
        user.password,
        user.salt,
      );
      if (!isValid) return done(null, null);

      const token = await this.issueTokenService.issueAccessToken(username);

      return done(null, {
        id: user.id,
        username: user.username,
        ...token,
      } as AuthenticationResponseInterface);
    } catch (err) {
      return done(err);
    }
  }
}
