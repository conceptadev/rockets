import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';
import {
  JwtIssueTokenService,
  JwtVerifyTokenService,
  JwtVerifyTokenServiceInterface,
} from '@concepta/nestjs-jwt';

import { AUTHENTICATION_MODULE_SETTINGS_TOKEN } from './authentication.constants';

import { AuthenticationOptionsInterface } from './interfaces/authentication-options.interface';
import { AuthenticationOptionsExtrasInterface } from './interfaces/authentication-options-extras.interface';
import { AuthenticationSettingsInterface } from './interfaces/authentication-settings.interface';
import { ValidateTokenServiceInterface } from './interfaces/validate-token-service.interface';
import { ValidateTokenService } from './authentication.constants';
import { VerifyTokenService } from './services/verify-token.service';
import { IssueTokenService } from './services/issue-token.service';
import { authenticationDefaultConfig } from './config/authentication-default.config';

const RAW_OPTIONS_TOKEN = Symbol('__AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthenticationModuleClass,
  OPTIONS_TYPE: AUTHENTICATION_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTHENTICATION_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthenticationOptionsInterface>({
  moduleName: 'Authentication',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthenticationOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthenticationOptions = Omit<
  typeof AUTHENTICATION_OPTIONS_TYPE,
  'global'
>;

export type AuthenticationAsyncOptions = Omit<
  typeof AUTHENTICATION_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthenticationOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false } = extras;

  return {
    ...definition,
    global,
    imports: createAuthenticationImports(),
    providers: createAuthenticationProviders({ providers }),
    exports: [
      ConfigModule,
      RAW_OPTIONS_TOKEN,
      ...(createAuthenticationExports() ?? []),
    ],
  };
}

export function createAuthenticationImports(): DynamicModule['imports'] {
  return [ConfigModule.forFeature(authenticationDefaultConfig)];
}

export function createAuthenticationExports(): DynamicModule['exports'] {
  return [
    AUTHENTICATION_MODULE_SETTINGS_TOKEN,
    ValidateTokenService,
    IssueTokenService,
    VerifyTokenService,
  ];
}

export function createAuthenticationProviders(options: {
  overrides?: AuthenticationOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    JwtIssueTokenService,
    JwtVerifyTokenService,
    createAuthenticationOptionsProvider(options.overrides),
    createAuthenticationVerifyTokenServiceProvider(options.overrides),
    createAuthenticationIssueTokenServiceProvider(options.overrides),
    createAuthenticationValidateTokenServiceProvider(options.overrides),
  ];
}

export function createAuthenticationOptionsProvider(
  optionsOverrides?: AuthenticationOptions,
): Provider {
  return createSettingsProvider<
    AuthenticationSettingsInterface,
    AuthenticationOptionsInterface
  >({
    settingsToken: AUTHENTICATION_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: authenticationDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAuthenticationIssueTokenServiceProvider(
  optionsOverrides?: AuthenticationOptions,
): Provider {
  return {
    provide: IssueTokenService,
    inject: [RAW_OPTIONS_TOKEN, JwtIssueTokenService],
    useFactory: async (
      options: AuthenticationOptionsInterface,
      jwtIssueTokenService: JwtIssueTokenService,
    ) =>
      optionsOverrides?.issueTokenService ??
      options.issueTokenService ??
      new IssueTokenService(jwtIssueTokenService),
  };
}

export function createAuthenticationVerifyTokenServiceProvider(
  optionsOverrides?: AuthenticationOptions,
): Provider {
  return {
    provide: VerifyTokenService,
    inject: [RAW_OPTIONS_TOKEN, JwtVerifyTokenService, ValidateTokenService],
    useFactory: async (
      options: AuthenticationOptionsInterface,
      jwtVerifyService: JwtVerifyTokenServiceInterface,
      validateTokenService: ValidateTokenServiceInterface,
    ) =>
      optionsOverrides?.verifyTokenService ??
      options.verifyTokenService ??
      new VerifyTokenService(jwtVerifyService, validateTokenService),
  };
}

export function createAuthenticationValidateTokenServiceProvider(
  optionsOverrides?: AuthenticationOptions,
): Provider {
  return {
    provide: ValidateTokenService,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthenticationOptionsInterface) =>
      optionsOverrides?.validateTokenService ?? options.validateTokenService,
  };
}
