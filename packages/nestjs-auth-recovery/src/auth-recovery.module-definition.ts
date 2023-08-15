import { EntityManager } from 'typeorm';
import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';
import { EntityManagerProxy } from '@concepta/typeorm-common';

import {
  AUTH_RECOVERY_MODULE_EMAIL_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_OTP_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AUTH_RECOVERY_MODULE_ENTITY_MANAGER_PROXY_TOKEN,
  AUTH_RECOVERY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from './auth-recovery.constants';

import { AuthRecoveryOptionsInterface } from './interfaces/auth-recovery-options.interface';
import { AuthRecoveryOptionsExtrasInterface } from './interfaces/auth-recovery-options-extras.interface';
import { AuthRecoverySettingsInterface } from './interfaces/auth-recovery-settings.interface';
import { authRecoveryDefaultConfig } from './config/auth-recovery-default.config';
import { AuthRecoveryController } from './auth-recovery.controller';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthRecoveryNotificationService } from './services/auth-recovery-notification.service';

const RAW_OPTIONS_TOKEN = Symbol('__AUTH_RECOVERY_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthRecoveryModuleClass,
  OPTIONS_TYPE: AUTH_RECOVERY_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTH_RECOVERY_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthRecoveryOptionsInterface>({
  moduleName: 'AuthRecovery',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthRecoveryOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthRecoveryOptions = Omit<
  typeof AUTH_RECOVERY_OPTIONS_TYPE,
  'global'
>;
export type AuthRecoveryAsyncOptions = Omit<
  typeof AUTH_RECOVERY_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthRecoveryOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { controllers, global = false } = extras;

  return {
    ...definition,
    global,
    imports: createAuthRecoveryImports(),
    providers: createAuthRecoveryProviders({ providers }),
    controllers: createAuthRecoveryControllers({ controllers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createAuthRecoveryExports()],
  };
}

export function createAuthRecoveryImports(): DynamicModule['imports'] {
  return [ConfigModule.forFeature(authRecoveryDefaultConfig)];
}

export function createAuthRecoveryExports() {
  return [
    AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
    AUTH_RECOVERY_MODULE_OTP_SERVICE_TOKEN,
    AUTH_RECOVERY_MODULE_EMAIL_SERVICE_TOKEN,
    AUTH_RECOVERY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    AUTH_RECOVERY_MODULE_USER_MUTATE_SERVICE_TOKEN,
    AuthRecoveryService,
  ];
}

export function createAuthRecoveryProviders(options: {
  overrides?: AuthRecoveryOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    AuthRecoveryService,
    AuthRecoveryNotificationService,
    createAuthRecoverySettingsProvider(options.overrides),
    createAuthRecoveryOtpServiceProvider(options.overrides),
    createAuthRecoveryEmailServiceProvider(options.overrides),
    createAuthRecoveryUserLookupServiceProvider(options.overrides),
    createAuthRecoveryUserMutateServiceProvider(options.overrides),
    createAuthRecoveryEntityManagerProxyProvider(options.overrides),
  ];
}

export function createAuthRecoveryControllers(
  overrides: Pick<AuthRecoveryOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [AuthRecoveryController];
}

export function createAuthRecoverySettingsProvider(
  optionsOverrides?: AuthRecoveryOptions,
): Provider {
  return createSettingsProvider<
    AuthRecoverySettingsInterface,
    AuthRecoveryOptionsInterface
  >({
    settingsToken: AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: authRecoveryDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAuthRecoveryOtpServiceProvider(
  optionsOverrides?: AuthRecoveryOptions,
): Provider {
  return {
    provide: AUTH_RECOVERY_MODULE_OTP_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthRecoveryOptionsInterface) =>
      optionsOverrides?.otpService ?? options.otpService,
  };
}

export function createAuthRecoveryEmailServiceProvider(
  optionsOverrides?: AuthRecoveryOptions,
): Provider {
  return {
    provide: AUTH_RECOVERY_MODULE_EMAIL_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthRecoveryOptionsInterface) =>
      optionsOverrides?.emailService ?? options.emailService,
  };
}

export function createAuthRecoveryUserLookupServiceProvider(
  optionsOverrides?: AuthRecoveryOptions,
): Provider {
  return {
    provide: AUTH_RECOVERY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthRecoveryOptionsInterface) =>
      optionsOverrides?.userLookupService ?? options.userLookupService,
  };
}

export function createAuthRecoveryUserMutateServiceProvider(
  optionsOverrides?: AuthRecoveryOptions,
): Provider {
  return {
    provide: AUTH_RECOVERY_MODULE_USER_MUTATE_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: AuthRecoveryOptionsInterface) =>
      optionsOverrides?.userMutateService ?? options.userMutateService,
  };
}

export function createAuthRecoveryEntityManagerProxyProvider(
  optionsOverrides?: AuthRecoveryOptions,
): Provider {
  return {
    provide: AUTH_RECOVERY_MODULE_ENTITY_MANAGER_PROXY_TOKEN,
    inject: [RAW_OPTIONS_TOKEN, getEntityManagerToken()],
    useFactory: async (
      options: AuthRecoveryOptionsInterface,
      defaultEntityManager: EntityManager,
    ) =>
      optionsOverrides?.entityManagerProxy ??
      options.entityManagerProxy ??
      new EntityManagerProxy(defaultEntityManager),
  };
}
