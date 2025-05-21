import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';

import {
  FEDERATED_MODULE_SETTINGS_TOKEN,
  FEDERATED_MODULE_USER_MODEL_SERVICE_TOKEN,
} from './federated.constants';

import { FederatedOptionsInterface } from './interfaces/federated-options.interface';
import { FederatedOptionsExtrasInterface } from './interfaces/federated-options-extras.interface';
import { FederatedSettingsInterface } from './interfaces/federated-settings.interface';
import { FederatedService } from './services/federated.service';
import { FederatedOAuthService } from './services/federated-oauth.service';
import { FederatedModelService } from './services/federated-model.service';
import { federatedDefaultConfig } from './config/federated-default.config';

const RAW_OPTIONS_TOKEN = Symbol('__FEDERATED_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: FederatedModuleClass,
  OPTIONS_TYPE: FEDERATED_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: FEDERATED_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<FederatedOptionsInterface>({
  moduleName: 'Federated',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<FederatedOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type FederatedOptions = Omit<typeof FEDERATED_OPTIONS_TYPE, 'global'>;

export type FederatedAsyncOptions = Omit<
  typeof FEDERATED_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: FederatedOptionsExtrasInterface,
): DynamicModule {
  const { imports = [], providers = [] } = definition;
  const { global = false } = extras;

  return {
    ...definition,
    global,
    imports: createFederatedImports({ imports }),
    providers: createFederatedProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createFederatedExports()],
  };
}

export function createFederatedImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(federatedDefaultConfig),
  ];
}

export function createFederatedExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    FEDERATED_MODULE_SETTINGS_TOKEN,
    FEDERATED_MODULE_USER_MODEL_SERVICE_TOKEN,
    FederatedService,
    FederatedOAuthService,
    FederatedModelService,
  ];
}

export function createFederatedProviders(options: {
  overrides?: FederatedOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    createFederatedSettingsProvider(options.overrides),
    createFederatedUserModelServiceProvider(options.overrides),
    FederatedService,
    FederatedOAuthService,
    FederatedModelService,
  ];
}

export function createFederatedSettingsProvider(
  optionsOverrides?: FederatedOptions,
): Provider {
  return createSettingsProvider<
    FederatedSettingsInterface,
    FederatedOptionsInterface
  >({
    settingsToken: FEDERATED_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: federatedDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createFederatedUserModelServiceProvider(
  optionsOverrides?: FederatedOptions,
): Provider {
  return {
    provide: FEDERATED_MODULE_USER_MODEL_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: FederatedOptionsInterface) =>
      optionsOverrides?.userModelService ?? options.userModelService,
  };
}
