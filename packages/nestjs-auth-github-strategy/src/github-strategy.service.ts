import { IVerifyOptions, Strategy } from 'passport-github';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import passport from 'passport';
import { GetUserServiceInterface } from '@rockts-org/nestjs-authentication';
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
    private userService: GetUserServiceInterface
  ) { }

  onModuleInit() {
    
    // Create a Local Strategy manually
    const localStrategy = new Strategy({
      clientID: this.config.clientId,
      clientSecret: this.config.clientSecret,
      callbackURL: this.config.callbackURL
    }, this.validate);
    
    localStrategy.name = GITHUB_STRATEGY_NAME;
    
    passport.use(localStrategy);
  }

  async validate(accessToken, refreshToken, profile, done: (error: any, user?: any, options?: IVerifyOptions) => void): Promise<any> {
    const user = await this.userService.getGithubProfileId(profile);
    
    if (!user) {
      return done(new Error('User does not exists'), false);
    }

    const result = {
      id: user.id,
      username: user.username,
      accessToken,
      refreshToken
    };

    return done(null, result);
  }
}

