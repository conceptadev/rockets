import {
  Abstract,
  DynamicModule,
  ForwardReference,
  Type,
} from '@nestjs/common';
import {
  OptionsAsyncInterface,
  OptionsInterface,
} from '@rockts-org/nestjs-common';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';

import { CredentialLookupInterface } from './credential-lookup.interface';

/**
 * Interface to be iim
 */
export interface CredentialLookupProvider {
  /**
   * Imports modules that exports instance of the provider to be injected
   */
  imports?: Array<
    Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory: (
    ...args: unknown[]
  ) => Promise<CredentialLookupInterface> | CredentialLookupInterface;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: Array<Type<unknown> | string | symbol | Abstract<unknown>>;
}

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface extends OptionsInterface {
  /**
   * Min level of password strength allowed
   */
  minPasswordStrength?: PasswordStrengthEnum;

  /**
   * Max number of password attempts allowed
   */
  maxPasswordAttempts?: number;
}

/**
 * Authentication async module configuration options interface
 */
export interface AuthenticationAsyncOptionsInterface
  extends AuthenticationOptionsInterface,
    OptionsAsyncInterface<AuthenticationOptionsInterface> {}
