import { IVerifyOptions, Strategy } from 'passport-github';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  AuthenticationService,
  GetUserServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { GITHUB_MODULE_OPTIONS_TOKEN } from './config/github.config';
import { GithubOptionsInterface } from './interfaces/github-options.interface';
import { GITHUB_STRATEGY_NAME } from './constants';

/**
 * Use this service to authenticate using middleware instead of authGuard
 */
@Injectable()
export class GithubStrategyService implements OnModuleInit {
  constructor(
    @Inject(GITHUB_MODULE_OPTIONS_TOKEN)
    private config: GithubOptionsInterface,
    private userService: GetUserServiceInterface,
    private authenticationService: AuthenticationService,
  ) {}

  onModuleInit() {
    // TODO: Define how to setup strategy for fastify
    const strategy = new Strategy(
      {
        clientID: this.config.clientId,
        clientSecret: this.config.clientSecret,
        callbackURL: this.config.callbackURL,
      },
      this.validate,
    );

    strategy.name = GITHUB_STRATEGY_NAME;

    this.authenticationService.use(GITHUB_STRATEGY_NAME, strategy);
  }

  async validate(
    accessToken,
    refreshToken,
    profile,
    done: (
      error: unknown,
      user?: AuthenticationResponseInterface,
      options?: IVerifyOptions,
    ) => void,
  ): Promise<void> {
    const user = await this.userService.getGithubProfileId(profile);

    if (!user) {
      return done(new Error('User does not exists'), null);
    }

    const result: AuthenticationResponseInterface = {
      id: user.id,
      username: user.username,
      accessToken,
    };

    return done(null, result);
  }
}
