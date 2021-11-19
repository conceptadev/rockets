import { IVerifyOptions, Strategy } from 'passport-local';

import { Injectable, OnModuleInit } from '@nestjs/common';

import passport from 'passport';
import { GetUserServiceInterface } from '../../interfaces/get-user-service.interface';
import { IssueTokenServiceInterface } from '../../interfaces/issue-token-service.interface';
import { PasswordStorageServiceInterface } from '../../interfaces/password-storage-service.interface';
 
/**
 * Use this service to authenticate using middleware instead of authGuard
 */
@Injectable()
export class LocalStrategyService implements OnModuleInit {
  constructor(
    private userService: GetUserServiceInterface,
    private passwordService: PasswordStorageServiceInterface,
    private issueTokenService: IssueTokenServiceInterface,
  ) { }

  onModuleInit() {
    
    // Create a Local Strategy manually
    const localStrategy = new Strategy(this.validate);
    localStrategy.name = 'local';
    
    passport.use(localStrategy);
   
  }

  /**
   * Validate Username and password and return the user
   * user will be added to the Request.user property
   * @param username 
   * @param pass 
   * @param done 
   * @returns 
   */
  async validate(username: string, pass: string, done: (error: any, user?: any, options?: IVerifyOptions) => void): Promise<any> {
    try {
      const user = await this.userService.getUser(username);
      if (!user) {
        return done(null, false)
      }

      const isValid = await this.passwordService.validatePassword(pass, user.password, user.salt)
      if (!isValid)
        return done(null, false)
      
      const token = await this.issueTokenService.issueAccessToken(username);
    
      return done(null, {
        id: user.id,
        username: user.username,
        ...token
      });

    } catch (err) {
      return done(err); 
    }
  }
}

