import { createSettingsProvider } from '@concepta/nestjs-common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AUTH_HISTORY_MODULE_SETTINGS_TOKEN } from './auth-history.constants';

import { AuthHistoryEntitiesOptionsInterface } from './interfaces/auth-history-entities-options.interface';
import { AuthHistoryOptionsExtrasInterface } from './interfaces/auth-history-options-extras.interface';
import { AuthHistoryOptionsInterface } from './interfaces/auth-history-options.interface';
import { AuthHistorySettingsInterface } from './interfaces/auth-history-settings.interface';

import { AuthHistoryController } from './auth-history.controller';
import { AuthHistoryCrudService } from './services/auth-history-crud.service';

import { authHistoryDefaultConfig } from './config/auth-history-default.config';
import { AuthHistoryAccessQueryService } from './services/auth-history-query.service';

const RAW_OPTIONS_TOKEN = Symbol('__AUTH_HISTORY_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthHistoryModuleClass,
  OPTIONS_TYPE: AUTH_HISTORY_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AuthHistory_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthHistoryOptionsInterface>({
  moduleName: 'AuthHistory',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthHistoryOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthHistoryOptions = Omit<
  typeof AUTH_HISTORY_OPTIONS_TYPE,
  'global'
>;
export type AuthHistoryAsyncOptions = Omit<
  typeof AuthHistory_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthHistoryOptionsExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;
  const { controllers, global = false, entities } = extras;

  if (!entities) {
    throw new Error('You must provide the entities option');
  }

  return {
    ...definition,
    global,
    imports: createAuthHistoryImports({ imports, entities }),
    providers: createAuthHistoryProviders({ providers }),
    controllers: createAuthHistoryControllers({ controllers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createAuthHistoryExports()],
  };
}

export function createAuthHistoryImports(
  options: Pick<DynamicModule, 'imports'> & AuthHistoryEntitiesOptionsInterface,
): Required<Pick<DynamicModule, 'imports'>>['imports'] {
  return [
    ...(options.imports ?? []),
    ConfigModule.forFeature(authHistoryDefaultConfig),
    TypeOrmExtModule.forFeature(options.entities),
  ];
}

export function createAuthHistoryProviders(options: {
  overrides?: AuthHistoryOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    AuthHistoryCrudService,
    createAuthHistorySettingsProvider(options.overrides),
    createAuthHistoryAccessQueryServiceProvider(options.overrides),
  ];
}

export function createAuthHistoryExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [AUTH_HISTORY_MODULE_SETTINGS_TOKEN, AuthHistoryCrudService];
}

export function createAuthHistoryControllers(
  overrides: Pick<AuthHistoryOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [AuthHistoryController];
}

export function createAuthHistorySettingsProvider(
  optionsOverrides?: AuthHistoryOptions,
): Provider {
  return createSettingsProvider<
    AuthHistorySettingsInterface,
    AuthHistoryOptionsInterface
  >({
    settingsToken: AUTH_HISTORY_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: authHistoryDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAuthHistoryAccessQueryServiceProvider(
  optionsOverrides?: AuthHistoryOptions,
): Provider {
  return {
    provide: AuthHistoryAccessQueryService,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthHistoryOptionsInterface) =>
      optionsOverrides?.authHistoryAccessQueryService ??
      options.authHistoryAccessQueryService ??
      new AuthHistoryAccessQueryService(),
  };
}
