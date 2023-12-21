import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';

import { PASSWORD_MODULE_SETTINGS_TOKEN } from './password.constants';
import { PasswordOptionsInterface } from './interfaces/password-options.interface';
import { PasswordOptionsExtrasInterface } from './interfaces/password-options-extras.interface';
import { PasswordSettingsInterface } from './interfaces/password-settings.interface';

import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';
import { PasswordValidationService } from './services/password-validation.service';
import { passwordDefaultConfig } from './config/password-default.config';

const RAW_OPTIONS_TOKEN = Symbol('__PASSWORD_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: PasswordModuleClass,
  OPTIONS_TYPE: PASSWORD_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: PASSWORD_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<PasswordOptionsInterface>({
  moduleName: 'Password',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<PasswordOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type PasswordOptions = Omit<typeof PASSWORD_OPTIONS_TYPE, 'global'>;
export type PasswordAsyncOptions = Omit<
  typeof PASSWORD_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: PasswordOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { global = false } = extras;

  return {
    ...definition,
    global,
    imports: createPasswordImports(),
    providers: createPasswordProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createPasswordExports()],
  };
}

export function createPasswordImports(): DynamicModule['imports'] {
  return [ConfigModule.forFeature(passwordDefaultConfig)];
}

export function createPasswordProviders(overrides: {
  options?: PasswordOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(overrides.providers ?? []),
    createPasswordSettingsProvider(overrides.options),
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
    PasswordValidationService,
  ];
}

export function createPasswordExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    PASSWORD_MODULE_SETTINGS_TOKEN,
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
    PasswordValidationService,
  ];
}

export function createPasswordSettingsProvider(
  optionsOverrides?: PasswordOptions,
): Provider {
  return createSettingsProvider<
    PasswordSettingsInterface,
    PasswordOptionsInterface
  >({
    settingsToken: PASSWORD_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: passwordDefaultConfig.KEY,
    optionsOverrides,
  });
}
