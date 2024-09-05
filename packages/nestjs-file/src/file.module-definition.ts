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
  FILE_STORAGE_SERVICE_KEY,
} from './file.constants';

import { FileOptionsInterface } from './interfaces/file-options.interface';
import { FileEntitiesOptionsInterface } from './interfaces/file-entities-options.interface';
import { FileOptionsExtrasInterface } from './interfaces/file-options-extras.interface';
import { FileSettingsInterface } from './interfaces/file-settings.interface';
import { FileService } from './services/file.service';
import { fileDefaultConfig } from './config/federated-default.config';
import { FileStorageService } from './services/file-storage.service';

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
  const { providers = [] } = definition;
  const { global = false, entities } = extras;

  if (!entities) {
    throw new Error('You must provide the entities option');
  }

  return {
    ...definition,
    global,
    imports: createFileImports({ entities }),
    providers: createFileProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createFileExports()],
  };
}

export function createFileImports(
  options: FileEntitiesOptionsInterface,
): DynamicModule['imports'] {
  return [
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
    createStorageServiceProvider(options.overrides),
    FileStorageService,
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

export function createStorageServiceProvider(
  optionsOverrides?: FileOptions,
): Provider {
  return {
    provide: FILE_STORAGE_SERVICE_KEY,
    inject: [RAW_OPTIONS_TOKEN, FileStorageService],
    useFactory: async (
      options: FileOptionsInterface,
      fileStorageService: FileStorageService,
    ) => {
      const storageServices =
        optionsOverrides?.storageServices ?? options.storageServices;

      storageServices?.forEach((storageService) => {
        fileStorageService.addStorageService(storageService);
      });

      return fileStorageService;
    },
  };
}
