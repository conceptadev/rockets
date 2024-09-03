import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';
import { NestJwtModule } from './jwt.externals';

import {
  JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
  JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
  JWT_MODULE_SETTINGS_TOKEN,
} from './jwt.constants';

import { JwtOptionsExtrasInterface } from './interfaces/jwt-options-extras.interface';
import { jwtDefaultConfig } from './config/jwt-default.config';
import { JwtSettingsInterface } from './interfaces/jwt-settings.interface';
import { JwtOptionsInterface } from './interfaces/jwt-options.interface';
import { JwtServiceInterface } from './interfaces/jwt-service.interface';
import { JwtService } from './services/jwt.service';
import { JwtIssueService } from './services/jwt-issue.service';
import { JwtVerifyService } from './services/jwt-verify.service';

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
    JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
    JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    JwtService,
    JwtIssueService,
    JwtVerifyService,
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
    provide: JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
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
    provide: JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
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
    provide: JwtIssueService,
    inject: [
      RAW_OPTIONS_TOKEN,
      JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
      JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    ],
    useFactory: async (
      options: JwtOptionsInterface,
      jwtAccessService: JwtServiceInterface,
      jwtRefreshService: JwtServiceInterface,
    ) =>
      optionsOverrides?.jwtIssueService ??
      options.jwtIssueService ??
      new JwtIssueService(jwtAccessService, jwtRefreshService),
  };
}

export function createJwtVerifyServiceProvider(
  optionsOverrides?: JwtOptions,
): Provider {
  return {
    provide: JwtVerifyService,
    inject: [
      RAW_OPTIONS_TOKEN,
      JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
      JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    ],
    useFactory: async (
      options: JwtOptionsInterface,
      jwtAccessService: JwtServiceInterface,
      jwtRefreshService: JwtServiceInterface,
    ) =>
      optionsOverrides?.jwtVerifyService ??
      options.jwtVerifyService ??
      new JwtVerifyService(jwtAccessService, jwtRefreshService),
  };
}
