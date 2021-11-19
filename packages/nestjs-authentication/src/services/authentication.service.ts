import { Injectable } from '@nestjs/common';
import { AuthenticationServiceInterface } from '../interfaces/authentication-service.interface';
import passport, { AuthenticateOptions, Strategy } from 'passport';

/**
 * Service with functions related to the sign in
 * This should be used to authenticate user a user
 */

@Injectable()
export class AuthenticationService implements AuthenticationServiceInterface<string> {
  /**
   * constructor
   */
  constructor() {}

  /**
   * Authenticate user and return access token information
   * @param dto
   * @returns Promise<AccessTokenInterface>
   */
  authenticate(
    strategy: string | Strategy,
    options?: AuthenticateOptions,
    callback?: (...args: any[]) => any
  ): void {
    // if express
    passport.authenticate(strategy, options, callback);
    
  }

  use(
    name: string,
    strategy: Strategy
  ): void {
    passport.use(name, strategy);
  }

}
