import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';
import { NestJwtModule } from './jwt.externals';

import {
  JWT_MODULE_SETTINGS_TOKEN,
  JwtAccessService,
  JwtRefreshService,
} from './jwt.constants';

import { JwtOptionsExtrasInterface } from './interfaces/jwt-options-extras.interface';
import { jwtDefaultConfig } from './config/jwt-default.config';
import { JwtSettingsInterface } from './interfaces/jwt-settings.interface';
import { JwtOptionsInterface } from './interfaces/jwt-options.interface';
import { JwtServiceInterface } from './interfaces/jwt-service.interface';
import { JwtService } from './services/jwt.service';
import { JwtIssueTokenService } from './services/jwt-issue-token.service';
import { JwtVerifyTokenService } from './services/jwt-verify-token.service';

const RAW_OPTIONS_TOKEN = Symbol('__JWT_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: JwtModuleClass,
  OPTIONS_TYPE: JWT_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: JWT_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<JwtOptionsInterface>({
  moduleName: 'Jwt',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<JwtOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

export type JwtOptions = Omit<typeof JWT_OPTIONS_TYPE, 'global'>;
export type JwtAsyncOptions = Omit<typeof JWT_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: JwtOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false, imports } = extras;

  return {
    ...definition,
    global,
    imports: createJwtImports({ imports }),
    providers: createJwtProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createJwtExports()],
  };
}

export function createJwtImports(
  overrides?: JwtOptions,
): DynamicModule['imports'] {
  const imports = [ConfigModule.forFeature(jwtDefaultConfig)];

  if (overrides?.imports?.length) {
    return [...imports, ...overrides.imports];
  } else {
    return [...imports, NestJwtModule.register({})];
  }
}

export function createJwtExports() {
  return [
    JWT_MODULE_SETTINGS_TOKEN,
    JwtAccessService,
    JwtRefreshService,
    JwtService,
    JwtIssueTokenService,
    JwtVerifyTokenService,
  ];
}

export function createJwtProviders(options: {
  overrides?: JwtOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createJwtSettingsProvider(options.overrides),
    createJwtServiceAccessTokenProvider(options.overrides),
    createJwtServiceRefreshTokenProvider(options.overrides),
    createJwtServiceProvider(options.overrides),
    createJwtIssueServiceProvider(options.overrides),
    createJwtVerifyServiceProvider(options.overrides),
  ];
}

export function createJwtSettingsProvider(
  optionsOverrides?: JwtOptions,
): Provider {
  return createSettingsProvider<JwtSettingsInterface, JwtOptionsInterface>({
    settingsToken: JWT_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: jwtDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createJwtServiceAccessTokenProvider(
  optionsOverrides?: JwtOptions,
): Provider {
  return {
    provide: JwtAccessService,
    inject: [RAW_OPTIONS_TOKEN, JWT_MODULE_SETTINGS_TOKEN],
    useFactory: async (
      options: JwtOptionsInterface,
      settings: JwtSettingsInterface,
    ) =>
      optionsOverrides?.jwtAccessService ??
      options.jwtAccessService ??
      new JwtService(settings.access ?? {}),
  };
}

export function createJwtServiceRefreshTokenProvider(
  optionsOverrides?: JwtOptions,
): Provider {
  return {
    provide: JwtRefreshService,
    inject: [RAW_OPTIONS_TOKEN, JWT_MODULE_SETTINGS_TOKEN],
    useFactory: async (
      options: JwtOptionsInterface,
      settings: JwtSettingsInterface,
    ) =>
      optionsOverrides?.jwtRefreshService ??
      options.jwtRefreshService ??
      new JwtService(settings.refresh ?? {}),
  };
}

export function createJwtServiceProvider(
  optionsOverrides?: JwtOptions,
): Provider {
  return {
    provide: JwtService,
    inject: [RAW_OPTIONS_TOKEN, JWT_MODULE_SETTINGS_TOKEN],
    useFactory: async (
      options: JwtOptionsInterface,
      settings: JwtSettingsInterface,
    ) =>
      optionsOverrides?.jwtService ??
      options.jwtService ??
      new JwtService(settings?.default),
  };
}

export function createJwtIssueServiceProvider(
  optionsOverrides?: JwtOptions,
): Provider {
  return {
    provide: JwtIssueTokenService,
    inject: [RAW_OPTIONS_TOKEN, JwtAccessService, JwtRefreshService],
    useFactory: async (
      options: JwtOptionsInterface,
      jwtAccessService: JwtServiceInterface,
      jwtRefreshService: JwtServiceInterface,
    ) =>
      optionsOverrides?.jwtIssueTokenService ??
      options.jwtIssueTokenService ??
      new JwtIssueTokenService(jwtAccessService, jwtRefreshService),
  };
}

export function createJwtVerifyServiceProvider(
  optionsOverrides?: JwtOptions,
): Provider {
  return {
    provide: JwtVerifyTokenService,
    inject: [RAW_OPTIONS_TOKEN, JwtAccessService, JwtRefreshService],
    useFactory: async (
      options: JwtOptionsInterface,
      jwtAccessService: JwtServiceInterface,
      jwtRefreshService: JwtServiceInterface,
    ) =>
      optionsOverrides?.jwtVerifyTokenService ??
      options.jwtVerifyTokenService ??
      new JwtVerifyTokenService(jwtAccessService, jwtRefreshService),
  };
}
