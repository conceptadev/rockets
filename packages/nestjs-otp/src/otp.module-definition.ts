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
  OTP_MODULE_REPOSITORIES_TOKEN,
  OTP_MODULE_SETTINGS_TOKEN,
} from './otp.constants';

import { OtpOptionsInterface } from './interfaces/otp-options.interface';
import { OtpOptionsExtrasInterface } from './interfaces/otp-options-extras.interface';
import { OtpSettingsInterface } from './interfaces/otp-settings.interface';

import { OtpService } from './services/otp.service';
import { otpDefaultConfig } from './config/otp-default.config';
import { OtpMissingEntitiesOptionsException } from './exceptions/otp-missing-entities-options.exception';

const RAW_OPTIONS_TOKEN = Symbol('__OTP_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: OtpModuleClass,
  OPTIONS_TYPE: OTP_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: OTP_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<OtpOptionsInterface>({
  moduleName: 'Otp',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<OtpOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

export type OtpOptions = Omit<typeof OTP_OPTIONS_TYPE, 'global'>;
export type OtpAsyncOptions = Omit<typeof OTP_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: OtpOptionsExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;
  const { global = false, entities } = extras;

  if (!entities || entities.length === 0) {
    throw new OtpMissingEntitiesOptionsException();
  }

  return {
    ...definition,
    global,
    imports: createOtpImports({ imports }),
    providers: createOtpProviders({ entities, providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createOtpExports()],
  };
}

export function createOtpImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(otpDefaultConfig),
  ];
}

export function createOtpProviders(options: {
  entities: string[];
  overrides?: OtpOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    OtpService,
    createOtpSettingsProvider(options.overrides),
    createOtpRepositoriesProvider({
      entities: options.entities,
    }),
  ];
}

export function createOtpExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [OTP_MODULE_SETTINGS_TOKEN, OTP_MODULE_REPOSITORIES_TOKEN, OtpService];
}

export function createOtpSettingsProvider(
  optionsOverrides?: OtpOptions,
): Provider {
  return createSettingsProvider<OtpSettingsInterface, OtpOptionsInterface>({
    settingsToken: OTP_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: otpDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createOtpRepositoriesProvider(options: {
  entities: string[];
}): Provider {
  const { entities } = options;

  const reposToInject = [];
  const keyTracker: Record<string, number> = {};

  let entityIdx = 0;

  for (const entityKey of entities) {
    reposToInject[entityIdx] = getDynamicRepositoryToken(entityKey);
    keyTracker[entityKey] = entityIdx++;
  }

  return {
    provide: OTP_MODULE_REPOSITORIES_TOKEN,
    useFactory: (...args: string[]) => {
      const repoInstances: Record<string, string> = {};

      for (const entityKey of entities) {
        repoInstances[entityKey] = args[keyTracker[entityKey]];
      }

      return repoInstances;
    },
    inject: reposToInject,
  };
}
