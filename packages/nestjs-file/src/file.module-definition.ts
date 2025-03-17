import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { createSettingsProvider } from '@concepta/nestjs-common';

import {
  FILE_MODULE_SETTINGS_TOKEN,
  FILE_STRATEGY_SERVICE_KEY,
} from './file.constants';

import { FileOptionsInterface } from './interfaces/file-options.interface';
import { FileEntitiesOptionsInterface } from './interfaces/file-entities-options.interface';
import { FileOptionsExtrasInterface } from './interfaces/file-options-extras.interface';
import { FileSettingsInterface } from './interfaces/file-settings.interface';
import { FileService } from './services/file.service';
import { FileStrategyService } from './services/file-strategy.service';

import { fileDefaultConfig } from './config/file-default.config';
import { FileMutateService } from './services/file-mutate.service';
import { FileLookupService } from './services/file-lookup.service';
import { FileMissingEntitiesOptionsException } from './exceptions/file-missing-entities-options.exception';

const RAW_OPTIONS_TOKEN = Symbol('__FILE_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: FileModuleClass,
  OPTIONS_TYPE: FILE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: FILE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<FileOptionsInterface>({
  moduleName: 'File',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<FileOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

export type FileOptions = Omit<typeof FILE_OPTIONS_TYPE, 'global'>;

export type FileAsyncOptions = Omit<typeof FILE_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: FileOptionsExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;
  const { global = false, entities } = extras;

  if (!entities) {
    throw new FileMissingEntitiesOptionsException();
  }

  return {
    ...definition,
    global,
    imports: createFileImports({ imports, entities }),
    providers: createFileProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createFileExports()],
  };
}

export function createFileImports(
  options: Pick<DynamicModule, 'imports'> & FileEntitiesOptionsInterface,
): DynamicModule['imports'] {
  return [
    ...(options.imports ?? []),
    ConfigModule.forFeature(fileDefaultConfig),
    TypeOrmExtModule.forFeature(options.entities),
  ];
}

export function createFileExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [FILE_MODULE_SETTINGS_TOKEN, FileService];
}

export function createFileProviders(options: {
  overrides?: FileOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createFileSettingsProvider(options.overrides),
    createStrategyServiceProvider(options.overrides),
    // TODO: move to be overwrittable
    FileMutateService,
    // TODO: move to be overwrittable
    FileLookupService,
    FileStrategyService,
    FileService,
  ];
}

export function createFileSettingsProvider(
  optionsOverrides?: FileOptions,
): Provider {
  return createSettingsProvider<FileSettingsInterface, FileOptionsInterface>({
    settingsToken: FILE_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: fileDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createStrategyServiceProvider(
  optionsOverrides?: FileOptions,
): Provider {
  return {
    provide: FILE_STRATEGY_SERVICE_KEY,
    inject: [RAW_OPTIONS_TOKEN, FileStrategyService],
    useFactory: async (
      options: FileOptionsInterface,
      fileStrategyService: FileStrategyService,
    ) => {
      const storageServices =
        optionsOverrides?.storageServices ?? options.storageServices;

      storageServices?.forEach((storageService) => {
        fileStrategyService.addStorageService(storageService);
      });

      return fileStrategyService;
    },
  };
}
