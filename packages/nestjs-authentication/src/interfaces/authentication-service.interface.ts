import { AuthenticateOptions } from 'passport';

/**
 * Authentication Service Interface
 */
//TODO: add generic AuthenticationServiceInterface<T> for future strategies??
export interface AuthenticationServiceInterface {
  /**
   * Authenticate using passport
   * @param strategy
   * @returns
   */
  // authenticate(
  //   strategy:  string | unknown,
  //   options?: AuthenticateOptions,
  //   callback?: (...args: unknown[]) => unknown,
  // ): Promise<unknown | void>;
  // use(
  //   strategy: string | any,
  // ): Promise<unknown | void>;
}
