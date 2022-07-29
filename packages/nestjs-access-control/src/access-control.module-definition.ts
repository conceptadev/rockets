import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';

import { AccessControlOptionsInterface } from './interfaces/access-control-options.interface';
import {
  ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
  ACCESS_CONTROL_MODULE_SETTINGS_TOKEN,
} from './constants';
import { AccessControlOptionsExtrasInterface } from './interfaces/access-control-options-extras.interface';
import { accessControlDefaultConfig } from './config/acess-control-default.config';
import { AccessControlSettingsInterface } from './interfaces/access-control-settings.interface';
import { AccessControlService } from './services/access-control.service';

export const {
  ConfigurableModuleClass: AccessControlModuleClass,
  OPTIONS_TYPE: ACCESS_CONTROL_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: ACCESS_CONTROL_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AccessControlOptionsInterface>({
  moduleName: 'AccessControl',
  optionsInjectionToken: ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
})
  .setExtras<AccessControlOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AccessControlOptions = Omit<
  typeof ACCESS_CONTROL_OPTIONS_TYPE,
  'global'
>;
export type AccessControlAsyncOptions = Omit<
  typeof ACCESS_CONTROL_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AccessControlOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false, imports } = extras;

  return {
    ...definition,
    global,
    imports: createAccessControlImports({ imports }),
    providers: createAccessControlProviders({ providers }),
    exports: [
      ConfigModule,
      ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
      ACCESS_CONTROL_MODULE_SETTINGS_TOKEN,
    ],
  };
}

export function createAccessControlImports(
  overrides?: Pick<AccessControlOptions, 'imports'>,
): DynamicModule['imports'] {
  const imports = [ConfigModule.forFeature(accessControlDefaultConfig)];

  if (overrides?.imports?.length) {
    return [...imports, ...overrides.imports];
  } else {
    return imports;
  }
}

export function createAccessControlProviders(overrides: {
  options?: AccessControlOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(overrides.providers ?? []),
    createAccessControlSettingsProvider(overrides.options),
    createAccessControlServiceProvider(overrides.options),
  ];
}

export function createAccessControlSettingsProvider(
  optionsOverrides?: AccessControlOptions,
): Provider {
  return createSettingsProvider<
    AccessControlSettingsInterface,
    AccessControlOptionsInterface
  >({
    settingsToken: ACCESS_CONTROL_MODULE_SETTINGS_TOKEN,
    optionsToken: ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
    settingsKey: accessControlDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAccessControlServiceProvider(
  optionsOverrides?: AccessControlOptions,
): Provider {
  return {
    provide: AccessControlService,
    inject: [ACCESS_CONTROL_MODULE_OPTIONS_TOKEN],
    useFactory: async (options: AccessControlOptionsInterface) =>
      optionsOverrides?.service ??
      options.service ??
      new AccessControlService(),
  };
}
