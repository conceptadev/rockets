import {
  Abstract,
  DynamicModule,
  ForwardReference,
  Type,
} from '@nestjs/common';

import { CredentialLookupInterface } from './credential-lookup.interface';
import { OptionsInterface } from '@rockts-org/nestjs-common';

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
export interface AuthenticationOptionsInterface extends OptionsInterface {}
