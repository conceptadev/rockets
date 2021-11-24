import {
  Abstract,
  DynamicModule,
  FactoryProvider,
  ForwardReference,
  ModuleMetadata,
  Type,
} from '@nestjs/common';

import { AuthenticationConfigOptionsInterface } from './authentication-config-options.interface';
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

export interface AuthenticationConfigAsyncOptionsInterface
  extends Pick<
    FactoryProvider<
      | AuthenticationConfigOptionsInterface
      | Promise<AuthenticationConfigOptionsInterface>
    >,
    'useFactory' | 'inject'
  > {}

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface
  extends Pick<ModuleMetadata, 'imports'> {
  config?: AuthenticationConfigOptionsInterface;
}

/**
 * Authentication async module configuration options interface
 */
export interface AuthenticationOptionsAsyncInterface
  extends Pick<ModuleMetadata, 'imports'> {
  config?: AuthenticationConfigAsyncOptionsInterface;
}
