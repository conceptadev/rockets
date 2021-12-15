import {
  Abstract,
  DynamicModule,
  FactoryProvider,
  ForwardReference,
  ModuleMetadata,
  Type,
} from '@nestjs/common';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';

import { CredentialLookupServiceInterface } from './credential-lookup-service.interface';

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
  ) =>
    | Promise<CredentialLookupServiceInterface>
    | CredentialLookupServiceInterface;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: Array<Type<unknown> | string | symbol | Abstract<unknown>>;
}

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface
  extends Pick<ModuleMetadata, 'imports'> {
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
    Pick<
      FactoryProvider<
        AuthenticationOptionsInterface | Promise<AuthenticationOptionsInterface>
      >,
      'useFactory' | 'inject'
    > {}
