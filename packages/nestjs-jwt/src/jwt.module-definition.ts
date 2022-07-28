import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  JwtModule as NestJwtModule,
  JwtService,
  JwtModuleOptions,
} from '@nestjs/jwt';
import { createSettingsProvider } from '@concepta/nestjs-common';

import {
  JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
  JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
  JWT_MODULE_OPTIONS_TOKEN,
  JWT_MODULE_SETTINGS_TOKEN,
} from './jwt.constants';

import { JwtOptionsExtrasInterface } from './interfaces/jwt-options-extras.interface';
import { jwtDefaultConfig } from './config/jwt-default.config';
import { JwtSettingsInterface } from './interfaces/jwt-settings.interface';
import { JwtOptionsInterface } from './interfaces/jwt-options.interface';
import { JwtSignService } from './services/jwt-sign.service';
import { JwtIssueService } from './services/jwt-issue.service';
import { JwtVerifyService } from './services/jwt-verify.service';

export const {
  ConfigurableModuleClass: JwtModuleClass,
  OPTIONS_TYPE: JWT_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: JWT_ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<JwtModuleOptions>({
  moduleName: 'Jwt',
  optionsInjectionToken: JWT_MODULE_OPTIONS_TOKEN,
})
  .setExtras<JwtOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

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
    exports: [
      ConfigModule,
      JWT_MODULE_OPTIONS_TOKEN,
      JWT_MODULE_SETTINGS_TOKEN,
      JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
      JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    ],
  };
}

export function createJwtImports(
  overrides?: JwtModuleOptions & JwtOptionsExtrasInterface,
): DynamicModule['imports'] {
  const imports = [ConfigModule.forFeature(jwtDefaultConfig)];

  if (overrides?.imports?.length) {
    return [...imports, ...overrides.imports];
  } else {
    return [...imports, NestJwtModule.register({})];
  }
}

export function createJwtProviders(options: {
  overrides?: JwtOptionsInterface;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createJwtSettingsProvider(options.overrides),
    createJwtServiceAccessTokenProvider(options.overrides),
    createJwtServiceRefreshTokenProvider(options.overrides),
    createJwtSignServiceProvider(options.overrides),
    createJwtIssueServiceProvider(options.overrides),
    createJwtVerifyServiceProvider(options.overrides),
  ];
}

export function createJwtSettingsProvider(
  optionsOverrides?: JwtOptionsInterface,
): Provider {
  return createSettingsProvider<JwtSettingsInterface, JwtOptionsInterface>({
    settingsToken: JWT_MODULE_SETTINGS_TOKEN,
    optionsToken: JWT_MODULE_OPTIONS_TOKEN,
    settingsKey: jwtDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createJwtServiceAccessTokenProvider(
  optionsOverrides?: JwtOptionsInterface,
): Provider {
  return {
    provide: JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
    inject: [JWT_MODULE_OPTIONS_TOKEN, JWT_MODULE_SETTINGS_TOKEN],
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
  optionsOverrides?: JwtOptionsInterface,
): Provider {
  return {
    provide: JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    inject: [JWT_MODULE_OPTIONS_TOKEN, JWT_MODULE_SETTINGS_TOKEN],
    useFactory: async (
      options: JwtOptionsInterface,
      settings: JwtSettingsInterface,
    ) =>
      optionsOverrides?.jwtRefreshService ??
      options.jwtRefreshService ??
      new JwtService(settings.refresh ?? {}),
  };
}

export function createJwtSignServiceProvider(
  optionsOverrides?: JwtOptionsInterface,
): Provider {
  return {
    provide: JwtSignService,
    inject: [
      JWT_MODULE_OPTIONS_TOKEN,
      JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
      JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    ],
    useFactory: async (
      options: JwtOptionsInterface,
      accessService: JwtService,
      refreshService: JwtService,
    ) =>
      optionsOverrides?.jwtSignService ??
      options.jwtSignService ??
      new JwtSignService(accessService, refreshService),
  };
}

export function createJwtIssueServiceProvider(
  optionsOverrides?: JwtOptionsInterface,
): Provider {
  return {
    provide: JwtIssueService,
    inject: [JWT_MODULE_OPTIONS_TOKEN, JwtSignService],
    useFactory: async (
      options: JwtOptionsInterface,
      signService: JwtSignService,
    ) =>
      optionsOverrides?.jwtIssueService ??
      options.jwtIssueService ??
      new JwtIssueService(signService),
  };
}

export function createJwtVerifyServiceProvider(
  optionsOverrides?: JwtOptionsInterface,
): Provider {
  return {
    provide: JwtVerifyService,
    inject: [JWT_MODULE_OPTIONS_TOKEN, JwtSignService],
    useFactory: async (
      options: JwtOptionsInterface,
      signService: JwtSignService,
    ) =>
      optionsOverrides?.jwtVerifyService ??
      options.jwtVerifyService ??
      new JwtVerifyService(signService),
  };
}
