import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';
import { FederatedOAuthService } from '@concepta/nestjs-federated';
import {
  IssueTokenService,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import {
  AUTH_GOOGLE_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_GOOGLE_MODULE_SETTINGS_TOKEN,
} from './auth-google.constants';

import { AuthGoogleOptionsInterface } from './interfaces/auth-google-options.interface';
import { AuthGoogleOptionsExtrasInterface } from './interfaces/auth-google-options-extras.interface';
import { authGoogleDefaultConfig } from './config/auth-google-default.config';
import { AuthGoogleSettingsInterface } from './interfaces/auth-google-settings.interface';
import { AuthGoogleController } from './auth-google.controller';
import { AuthGoogleStrategy } from './auth-google.strategy';

const RAW_OPTIONS_TOKEN = Symbol('__AUTH_GOOGLE_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthGoogleModuleClass,
  OPTIONS_TYPE: AUTH_GOOGLE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTH_GOOGLE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthGoogleOptionsInterface>({
  moduleName: 'AuthGoogle',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthGoogleOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthGoogleOptions = Omit<typeof AUTH_GOOGLE_OPTIONS_TYPE, 'global'>;
export type AuthGoogleAsyncOptions = Omit<
  typeof AUTH_GOOGLE_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthGoogleOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false, controllers } = extras;

  return {
    ...definition,
    global,
    imports: createAuthGoogleImports(),
    providers: createAuthGoogleProviders({ providers }),
    controllers: createAuthGoogleControllers({ controllers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createAuthGoogleExports()],
  };
}

export function createAuthGoogleImports(): DynamicModule['imports'] {
  return [ConfigModule.forFeature(authGoogleDefaultConfig)];
}

export function createAuthGoogleExports() {
  return [
    AUTH_GOOGLE_MODULE_SETTINGS_TOKEN,
    AUTH_GOOGLE_ISSUE_TOKEN_SERVICE_TOKEN,
  ];
}

export function createAuthGoogleControllers(
  overrides: AuthGoogleOptions = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [AuthGoogleController];
}

export function createAuthGoogleProviders(options: {
  overrides?: AuthGoogleOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    AuthGoogleStrategy,
    IssueTokenService,
    FederatedOAuthService,
    createAuthGoogleOptionsProvider(options.overrides),
    createAuthGoogleIssueTokenServiceProvider(options.overrides),
  ];
}

export function createAuthGoogleOptionsProvider(
  optionsOverrides?: AuthGoogleOptions,
): Provider {
  return createSettingsProvider<
    AuthGoogleSettingsInterface,
    AuthGoogleOptionsInterface
  >({
    settingsToken: AUTH_GOOGLE_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: authGoogleDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAuthGoogleIssueTokenServiceProvider(
  optionsOverrides?: AuthGoogleOptions,
): Provider {
  return {
    provide: AUTH_GOOGLE_ISSUE_TOKEN_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN, IssueTokenService],
    useFactory: async (
      options: AuthGoogleOptionsInterface,
      defaultService: IssueTokenServiceInterface,
    ) =>
      optionsOverrides?.issueTokenService ??
      options.issueTokenService ??
      defaultService,
  };
}
