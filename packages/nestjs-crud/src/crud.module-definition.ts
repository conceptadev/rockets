import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';

import { CrudOptionsInterface } from './interfaces/crud-options.interface';
import {
  CRUD_MODULE_OPTIONS_TOKEN,
  CRUD_MODULE_SETTINGS_TOKEN,
} from './crud.constants';
import { CrudOptionsExtrasInterface } from './interfaces/crud-options-extras.interface';
import { CrudSettingsInterface } from './interfaces/crud-settings.interface';
import { crudDefaultConfig } from './config/crud-default.config';

export const {
  ConfigurableModuleClass: CrudModuleClass,
  OPTIONS_TYPE: CRUD_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: CRUD_ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<CrudOptionsInterface>({
  moduleName: 'Crud',
  optionsInjectionToken: CRUD_MODULE_OPTIONS_TOKEN,
})
  .setExtras<CrudOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

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
    exports: [
      ConfigModule,
      CRUD_MODULE_OPTIONS_TOKEN,
      CRUD_MODULE_SETTINGS_TOKEN,
    ],
  };
}

export function createCrudImports(
  overrides?: CrudOptionsInterface & CrudOptionsExtrasInterface,
): DynamicModule['imports'] {
  const imports = [ConfigModule.forFeature(crudDefaultConfig)];

  if (overrides?.imports?.length) {
    return [...imports, ...overrides.imports];
  } else {
    return imports;
  }
}

export function createCrudProviders(options: {
  overrides?: CrudOptionsInterface;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createCrudSettingsProvider(options.overrides),
  ];
}

export function createCrudSettingsProvider(
  optionsOverrides?: CrudOptionsInterface,
): Provider {
  return createSettingsProvider<CrudSettingsInterface, CrudOptionsInterface>({
    settingsToken: CRUD_MODULE_SETTINGS_TOKEN,
    optionsToken: CRUD_MODULE_OPTIONS_TOKEN,
    settingsKey: crudDefaultConfig.KEY,
    optionsOverrides,
  });
}
