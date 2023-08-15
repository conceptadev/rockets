import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';

import { CrudOptionsInterface } from './interfaces/crud-options.interface';
import { CRUD_MODULE_SETTINGS_TOKEN } from './crud.constants';
import { CrudOptionsExtrasInterface } from './interfaces/crud-options-extras.interface';
import { CrudSettingsInterface } from './interfaces/crud-settings.interface';
import { crudDefaultConfig } from './config/crud-default.config';
import { CrudReflectionService } from './services/crud-reflection.service';

const RAW_OPTIONS_TOKEN = Symbol('__CRUD_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: CrudModuleClass,
  OPTIONS_TYPE: CRUD_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: CRUD_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<CrudOptionsInterface>({
  moduleName: 'Crud',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<CrudOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

export type CrudOptions = Omit<typeof CRUD_OPTIONS_TYPE, 'global'>;
export type CrudAsyncOptions = Omit<typeof CRUD_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: CrudOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false, imports } = extras;

  return {
    ...definition,
    global,
    imports: createCrudImports({ imports }),
    providers: createCrudProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createCrudExports()],
  };
}

export function createCrudImports(
  overrides?: CrudOptions,
): DynamicModule['imports'] {
  const imports = [ConfigModule.forFeature(crudDefaultConfig)];

  if (overrides?.imports?.length) {
    return [...imports, ...overrides.imports];
  } else {
    return imports;
  }
}

export function createCrudExports() {
  return [CRUD_MODULE_SETTINGS_TOKEN, CrudReflectionService];
}

export function createCrudProviders(options: {
  overrides?: CrudOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    CrudReflectionService,
    createCrudSettingsProvider(options.overrides),
  ];
}

export function createCrudSettingsProvider(
  optionsOverrides?: CrudOptions,
): Provider {
  return createSettingsProvider<CrudSettingsInterface, CrudOptionsInterface>({
    settingsToken: CRUD_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: crudDefaultConfig.KEY,
    optionsOverrides,
  });
}
