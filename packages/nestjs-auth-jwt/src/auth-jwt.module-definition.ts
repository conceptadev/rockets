import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  VerifyTokenService,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import { createSettingsProvider } from '@concepta/nestjs-common';

import { AuthJwtOptionsInterface } from './interfaces/auth-jwt-options.interface';
import { AuthJwtOptionsExtrasInterface } from './interfaces/auth-jwt-options-extras.interface';
import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';
import {
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
} from './auth-jwt.constants';
import { authJwtDefaultConfig } from './config/auth-jwt-default.config';

const RAW_OPTIONS_TOKEN = Symbol('__AUTH_JWT_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthJwtModuleClass,
  OPTIONS_TYPE: AUTH_JWT_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTH_JWT_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthJwtOptionsInterface>({
  moduleName: 'AuthJwt',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthJwtOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthJwtOptions = Omit<typeof AUTH_JWT_OPTIONS_TYPE, 'global'>;
export type AuthJwtAsyncOptions = Omit<
  typeof AUTH_JWT_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthJwtOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false } = extras;

  return {
    ...definition,
    global,
    imports: createAuthJwtImports(),
    providers: createAuthJwtProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createAuthJwtExports()],
  };
}

export function createAuthJwtImports(): DynamicModule['imports'] {
  return [ConfigModule.forFeature(authJwtDefaultConfig)];
}

export function createAuthJwtExports(): string[] {
  return [
    AUTH_JWT_MODULE_SETTINGS_TOKEN,
    AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
  ];
}

export function createAuthJwtProviders(options: {
  overrides?: AuthJwtOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    VerifyTokenService,
    createAuthJwtOptionsProvider(options.overrides),
    createAuthJwtVerifyTokenServiceProvider(options.overrides),
    createAuthJwtUserLookupServiceProvider(options.overrides),
  ];
}

export function createAuthJwtOptionsProvider(
  optionsOverrides?: AuthJwtOptions,
): Provider {
  return createSettingsProvider<
    AuthJwtSettingsInterface,
    AuthJwtOptionsInterface
  >({
    settingsToken: AUTH_JWT_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: authJwtDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAuthJwtVerifyTokenServiceProvider(
  optionsOverrides?: AuthJwtOptions,
): Provider {
  return {
    provide: AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN, VerifyTokenService],
    useFactory: async (
      options: AuthJwtOptionsInterface,
      defaultService: VerifyTokenServiceInterface,
    ) =>
      optionsOverrides?.verifyTokenService ??
      options.verifyTokenService ??
      defaultService,
  };
}

export function createAuthJwtUserLookupServiceProvider(
  optionsOverrides?: AuthJwtOptions,
): Provider {
  return {
    provide: AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthJwtOptionsInterface) =>
      optionsOverrides?.userLookupService ?? options.userLookupService,
  };
}
