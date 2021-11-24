import { Injectable } from '@nestjs/common';
import { AuthenticationServiceInterface } from '../interfaces/authentication-service.interface';
import passport, { AuthenticateOptions, Strategy } from 'passport';

/**
 * Service with functions related to the sign in
 * This should be used to authenticate user a user
 */

@Injectable()
export class AuthenticationService implements AuthenticationServiceInterface {
  /**
   * Authenticate user and return access token information
   * @param dto
   * @returns Promise<AccessTokenInterface>
   */
  async authenticate(
    strategy: string | Strategy,
    options?: AuthenticateOptions,
    callback?: (...args: unknown[]) => unknown,
  ): Promise<unknown> {
    // return new promise that will resolved passport.authenticate
    return new Promise<unknown>((resolve, reject) => {
      passport.authenticate(strategy, options, (...authArgs) => {
        return resolve(callback(authArgs));
      });
     
    });

            

    // return new Promise((resolve, reject) => {
    //   resolve(passport.authenticate(strategy, options, callback));
    // });
  }

  /**
   *
   * @param name
   * @param strategy
   */
  use(name: string, strategy: Strategy): void {
    passport.use(name, strategy);
  }
}
