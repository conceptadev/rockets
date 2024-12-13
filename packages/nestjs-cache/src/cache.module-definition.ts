import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';

import {
  CACHE_MODULE_CRUD_SERVICES_TOKEN,
  CACHE_MODULE_REPOSITORIES_TOKEN,
  CACHE_MODULE_SETTINGS_TOKEN,
} from './cache.constants';

import { CacheEntitiesOptionsInterface } from './interfaces/cache-entities-options.interface';
import { CacheOptionsExtrasInterface } from './interfaces/cache-options-extras.interface';
import { CacheOptionsInterface } from './interfaces/cache-options.interface';
import { CacheSettingsInterface } from './interfaces/cache-settings.interface';

import { CacheInterface } from '@concepta/nestjs-common';
import { Repository } from 'typeorm';
import { cacheDefaultConfig } from './config/cache-default.config';
import { CacheCrudController } from './controllers/cache-crud.controller';
import { CacheCrudService } from './services/cache-crud.service';
import { CacheService } from './services/cache.service';

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
  const { providers } = definition;
  const { controllers, global = false, entities } = extras;

  if (!entities) {
    throw new Error('You must provide the entities option');
  }

  return {
    ...definition,
    global,
    imports: createCacheImports({ entities }),
    providers: createCacheProviders({ entities, providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createCacheExports()],
    controllers: createCacheControllers({ controllers }),
  };
}

export function createCacheControllers(
  overrides: Pick<CacheOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [CacheCrudController];
}

export function createCacheImports(
  options: CacheEntitiesOptionsInterface,
): DynamicModule['imports'] {
  return [
    ConfigModule.forFeature(cacheDefaultConfig),
    TypeOrmExtModule.forFeature(options.entities),
  ];
}

export function createCacheProviders(
  options: CacheEntitiesOptionsInterface & {
    overrides?: CacheOptions;
    providers?: Provider[];
  },
): Provider[] {
  return [
    ...(options.providers ?? []),
    createCacheSettingsProvider(options.overrides),
    ...createCacheRepositoriesProvider({
      entities: options.overrides?.entities ?? options.entities,
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

export function createCacheRepositoriesProvider(
  options: CacheEntitiesOptionsInterface,
): Provider[] {
  const { entities } = options;

  const reposToInject = [];
  const keyTracker: Record<string, number> = {};

  let entityIdx = 0;

  for (const entityKey in entities) {
    reposToInject[entityIdx] = getDynamicRepositoryToken(entityKey);
    keyTracker[entityKey] = entityIdx++;
  }

  return [
    {
      provide: CACHE_MODULE_REPOSITORIES_TOKEN,
      inject: reposToInject,
      useFactory: (...args: string[]) => {
        const repoInstances: Record<string, string> = {};

        for (const entityKey in entities) {
          repoInstances[entityKey] = args[keyTracker[entityKey]];
        }

        return repoInstances;
      },
    },
    {
      provide: CACHE_MODULE_CRUD_SERVICES_TOKEN,
      inject: reposToInject,
      useFactory: (...args: Repository<CacheInterface>[]) => {
        const serviceInstances: Record<string, CacheCrudService> = {};

        for (const entityKey in entities) {
          serviceInstances[entityKey] = new CacheCrudService(
            args[keyTracker[entityKey]],
          );
        }

        return serviceInstances;
      },
    },
  ];
}
