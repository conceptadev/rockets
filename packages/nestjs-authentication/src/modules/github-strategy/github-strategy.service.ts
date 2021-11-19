import { IVerifyOptions, Strategy } from 'passport-github';

import { Injectable, OnModuleInit } from '@nestjs/common';

import passport from 'passport';
import { GetUserServiceInterface } from '../..';

/**
 * Use this service to authenticate using middleware instead of authGuard
 */
@Injectable()
export class GithubStrategyService implements OnModuleInit {
  constructor(
    private userService: GetUserServiceInterface
  ) { }

  onModuleInit() {
    
    // Create a Local Strategy manually
    const localStrategy = new Strategy(this.validate);
    
    localStrategy.name = 'github';
    
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

