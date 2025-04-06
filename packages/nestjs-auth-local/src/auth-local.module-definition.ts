import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';
import {
  PasswordValidationService,
  PasswordValidationServiceInterface,
} from '@concepta/nestjs-password';
import {
  IssueTokenService,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import {
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AuthLocalIssueTokenService,
  AuthLocalUserLookupService,
  AuthLocalPasswordValidationService,
} from './auth-local.constants';

import { AuthLocalOptionsExtrasInterface } from './interfaces/auth-local-options-extras.interface';
import { AuthLocalOptionsInterface } from './interfaces/auth-local-options.interface';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { authLocalDefaultConfig } from './config/auth-local-default.config';
import { AuthLocalController } from './auth-local.controller';
import { AuthLocalStrategy } from './auth-local.strategy';
import { AuthLocalValidateUserService } from './services/auth-local-validate-user.service';
import { AuthLocalUserLookupServiceInterface } from './interfaces/auth-local-user-lookup-service.interface';

const RAW_OPTIONS_TOKEN = Symbol('__AUTH_LOCAL_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthLocalModuleClass,
  OPTIONS_TYPE: AUTH_LOCAL_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTH_LOCAL_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthLocalOptionsInterface>({
  moduleName: 'AuthLocal',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthLocalOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthLocalOptions = Omit<typeof AUTH_LOCAL_OPTIONS_TYPE, 'global'>;
export type AuthLocalAsyncOptions = Omit<
  typeof AUTH_LOCAL_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthLocalOptionsExtrasInterface,
): DynamicModule {
  const { providers } = definition;
  const { controllers, global } = extras;

  return {
    ...definition,
    global,
    imports: createAuthLocalImports(),
    providers: createAuthLocalProviders({ providers }),
    controllers: createAuthLocalControllers({ controllers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createAuthLocalExports()],
  };
}

export function createAuthLocalImports(): DynamicModule['imports'] {
  return [ConfigModule.forFeature(authLocalDefaultConfig)];
}

export function createAuthLocalExports() {
  return [
    AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
    AuthLocalUserLookupService,
    AuthLocalIssueTokenService,
    AuthLocalPasswordValidationService,
    AuthLocalValidateUserService,
  ];
}

export function createAuthLocalProviders(options: {
  overrides?: AuthLocalOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    IssueTokenService,
    PasswordValidationService,
    AuthLocalStrategy,
    AuthLocalValidateUserService,
    createAuthLocalOptionsProvider(options.overrides),
    createAuthLocalValidateUserServiceProvider(options.overrides),
    createAuthLocalIssueTokenServiceProvider(options.overrides),
    createAuthLocalUserLookupServiceProvider(options.overrides),
    createAuthLocalPasswordValidationServiceProvider(options.overrides),
  ];
}

export function createAuthLocalControllers(
  overrides?: Pick<AuthLocalOptions, 'controllers'>,
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [AuthLocalController];
}

export function createAuthLocalOptionsProvider(
  optionsOverrides?: AuthLocalOptions,
): Provider {
  return createSettingsProvider<
    AuthLocalSettingsInterface,
    AuthLocalOptionsInterface
  >({
    settingsToken: AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: authLocalDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAuthLocalValidateUserServiceProvider(
  optionsOverrides?: Pick<AuthLocalOptions, 'validateUserService'>,
): Provider {
  return {
    provide: AuthLocalValidateUserService,
    inject: [
      RAW_OPTIONS_TOKEN,
      AuthLocalUserLookupService,
      AuthLocalPasswordValidationService,
    ],
    useFactory: async (
      options: Pick<AuthLocalOptions, 'validateUserService'>,
      userLookupService: AuthLocalUserLookupServiceInterface,
      passwordValidationService: PasswordValidationServiceInterface,
    ) =>
      optionsOverrides?.validateUserService ??
      options.validateUserService ??
      new AuthLocalValidateUserService(
        userLookupService,
        passwordValidationService,
      ),
  };
}

export function createAuthLocalIssueTokenServiceProvider(
  optionsOverrides?: Pick<AuthLocalOptions, 'issueTokenService'>,
): Provider {
  return {
    provide: AuthLocalIssueTokenService,
    inject: [RAW_OPTIONS_TOKEN, IssueTokenService],
    useFactory: async (
      options: Pick<AuthLocalOptions, 'issueTokenService'>,
      defaultService: IssueTokenServiceInterface,
    ) =>
      optionsOverrides?.issueTokenService ??
      options.issueTokenService ??
      defaultService,
  };
}

export function createAuthLocalPasswordValidationServiceProvider(
  optionsOverrides?: Pick<AuthLocalOptions, 'passwordValidationService'>,
): Provider {
  return {
    provide: AuthLocalPasswordValidationService,
    inject: [RAW_OPTIONS_TOKEN, PasswordValidationService],
    useFactory: async (
      options: Pick<AuthLocalOptions, 'passwordValidationService'>,
      defaultService: PasswordValidationServiceInterface,
    ) =>
      optionsOverrides?.passwordValidationService ??
      options.passwordValidationService ??
      defaultService,
  };
}

export function createAuthLocalUserLookupServiceProvider(
  optionsOverrides?: Pick<AuthLocalOptions, 'userLookupService'>,
): Provider {
  return {
    provide: AuthLocalUserLookupService,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthLocalOptionsInterface) =>
      optionsOverrides?.userLookupService ?? options.userLookupService,
  };
}
