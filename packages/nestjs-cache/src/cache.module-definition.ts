import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  createSettingsProvider,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-common';

import {
  CACHE_MODULE_REPOSITORIES_TOKEN,
  CACHE_MODULE_SETTINGS_TOKEN,
} from './cache.constants';

import { CacheOptionsExtrasInterface } from './interfaces/cache-options-extras.interface';
import { CacheOptionsInterface } from './interfaces/cache-options.interface';
import { CacheSettingsInterface } from './interfaces/cache-settings.interface';

import { cacheDefaultConfig } from './config/cache-default.config';
import { CacheService } from './services/cache.service';
import { CacheMissingEntitiesOptionException } from './exceptions/cache-missing-entities-option.exception';

const RAW_OPTIONS_TOKEN = Symbol('__CACHE_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: CacheModuleClass,
  OPTIONS_TYPE: CACHE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: CACHE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<CacheOptionsInterface>({
  moduleName: 'Cache',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<CacheOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type CacheOptions = Omit<typeof CACHE_OPTIONS_TYPE, 'global'>;
export type CacheAsyncOptions = Omit<typeof CACHE_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: CacheOptionsExtrasInterface,
): DynamicModule {
  const { imports, providers } = definition;
  const { global = false, entities } = extras;

  if (!entities || entities.length === 0) {
    throw new CacheMissingEntitiesOptionException();
  }

  return {
    ...definition,
    global,
    imports: createCacheImports({ imports }),
    providers: createCacheProviders({ entities, providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createCacheExports()],
  };
}

export function createCacheImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(cacheDefaultConfig),
  ];
}

export function createCacheProviders(options: {
  entities: string[];
  overrides?: CacheOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createCacheSettingsProvider(options.overrides),
    ...createCacheRepositoriesProvider({
      entities: options.entities,
    }),
    CacheService,
  ];
}

export function createCacheExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    CACHE_MODULE_SETTINGS_TOKEN,
    CACHE_MODULE_REPOSITORIES_TOKEN,
    CacheService,
  ];
}

export function createCacheSettingsProvider(
  optionsOverrides?: CacheOptions,
): Provider {
  return createSettingsProvider<CacheSettingsInterface, CacheOptionsInterface>({
    settingsToken: CACHE_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: cacheDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createCacheRepositoriesProvider(options: {
  entities: string[];
}): Provider[] {
  const { entities } = options;

  const reposToInject = [];
  const keyTracker: Record<string, number> = {};

  let entityIdx = 0;

  for (const entityKey of entities) {
    reposToInject[entityIdx] = getDynamicRepositoryToken(entityKey);
    keyTracker[entityKey] = entityIdx++;
  }

  return [
    {
      provide: CACHE_MODULE_REPOSITORIES_TOKEN,
      inject: reposToInject,
      useFactory: (...args: string[]) => {
        const repoInstances: Record<string, string> = {};

        for (const entityKey of entities) {
          repoInstances[entityKey] = args[keyTracker[entityKey]];
        }

        return repoInstances;
      },
    },
  ];
}
