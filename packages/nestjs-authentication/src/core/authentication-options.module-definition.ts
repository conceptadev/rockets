import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthenticationCombinedOptionsInterface } from './interfaces/authentication-combined-options.interface';
import { AuthenticationOptionsExtrasInterface } from './interfaces/authentication-options-extras.interface';

// Import configs
import { authenticationOptionsDefaultConfig } from '../config/authentication-options-default.config';

export const AUTHENTICATION_MODULE_OPTIONS_TOKEN = Symbol('__AUTHENTICATION_MODULE_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthenticationOptionsModuleClass,
  OPTIONS_TYPE: AUTHENTICATION_MODULE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTHENTICATION_MODULE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthenticationCombinedOptionsInterface>({
  moduleName: 'AuthenticationCombined',
  
  optionsInjectionToken: AUTHENTICATION_MODULE_OPTIONS_TOKEN,
})
  .setExtras<AuthenticationOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthenticationCombinedOptions = Omit<
  typeof AUTHENTICATION_MODULE_OPTIONS_TYPE,
  'global'
>;

export type AuthenticationCombinedAsyncOptions = Omit<
  typeof AUTHENTICATION_MODULE_ASYNC_OPTIONS_TYPE,
  'global'
>;

/**
 * Transform the definition to include the combined modules
 */
function definitionTransform(
  definition: DynamicModule,
  extras: AuthenticationOptionsExtrasInterface,
): DynamicModule {
  const { imports = [], providers = [], exports = [] } = definition;

  
  return {
    ...definition,
    global: extras.global,
    imports: createAuthenticationOptionsImports({ imports }),
    providers: createAuthenticationOptionsProviders({ providers }),
    exports: createAuthenticationOptionsExports({ exports }),
  };
}

/**
 * Create imports for the combined module
 */
export function createAuthenticationOptionsImports(options: {
  imports: DynamicModule['imports']
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(authenticationOptionsDefaultConfig),
  ];
}

/**
 * Create exports for the combined module
 */
export function createAuthenticationOptionsExports(options: {
  exports: DynamicModule['exports']
}): DynamicModule['exports'] {
  
  return [
    ...(options.exports || [] ),
    ConfigModule,
    AUTHENTICATION_MODULE_OPTIONS_TOKEN,
  ];
}

/**
 * Create providers for the combined module
 */
export function createAuthenticationOptionsProviders(options: {
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
  ];
} 