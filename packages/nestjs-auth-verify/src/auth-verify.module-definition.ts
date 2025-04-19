import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';

import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AuthVerifyEmailService,
  AuthVerifyOtpService,
  AuthVerifyUserModelService,
} from './auth-verify.constants';

import { AuthVerifyOptionsInterface } from './interfaces/auth-verify-options.interface';
import { AuthVerifyOptionsExtrasInterface } from './interfaces/auth-verify-options-extras.interface';
import { AuthVerifySettingsInterface } from './interfaces/auth-verify-settings.interface';
import { authVerifyDefaultConfig } from './config/auth-verify-default.config';
import { AuthVerifyController } from './auth-verify.controller';
import { AuthVerifyService } from './services/auth-verify.service';
import { AuthVerifyNotificationService } from './services/auth-verify-notification.service';
import { AuthVerifyEmailServiceInterface } from './interfaces/auth-verify-email.service.interface';

const RAW_OPTIONS_TOKEN = Symbol('__AUTH_VERIFY_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthVerifyModuleClass,
  OPTIONS_TYPE: AUTH_VERIFY_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTH_VERIFY_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthVerifyOptionsInterface>({
  moduleName: 'AuthVerify',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthVerifyOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthVerifyOptions = Omit<typeof AUTH_VERIFY_OPTIONS_TYPE, 'global'>;
export type AuthVerifyAsyncOptions = Omit<
  typeof AUTH_VERIFY_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: AuthVerifyOptionsExtrasInterface,
): DynamicModule {
  const { providers } = definition;
  const { controllers, global } = extras;

  return {
    ...definition,
    global,
    imports: createAuthVerifyImports(),
    providers: createAuthVerifyProviders({ providers }),
    controllers: createAuthVerifyControllers({ controllers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createAuthVerifyExports()],
  };
}

export function createAuthVerifyImports(): DynamicModule['imports'] {
  return [ConfigModule.forFeature(authVerifyDefaultConfig)];
}

export function createAuthVerifyExports() {
  return [
    AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
    AuthVerifyOtpService,
    AuthVerifyEmailService,
    AuthVerifyUserModelService,
    AuthVerifyService,
  ];
}

export function createAuthVerifyProviders(options: {
  overrides?: AuthVerifyOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    AuthVerifyService,
    createAuthVerifySettingsProvider(options.overrides),
    createAuthVerifyOtpServiceProvider(options.overrides),
    createAuthVerifyEmailServiceProvider(options.overrides),
    createAuthVerifyUserModelServiceProvider(options.overrides),
    createAuthVerifyNotificationServiceProvider(options.overrides),
  ];
}

export function createAuthVerifyControllers(
  overrides: Pick<AuthVerifyOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [AuthVerifyController];
}

export function createAuthVerifySettingsProvider(
  optionsOverrides?: AuthVerifyOptions,
): Provider {
  return createSettingsProvider<
    AuthVerifySettingsInterface,
    AuthVerifyOptionsInterface
  >({
    settingsToken: AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: authVerifyDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createAuthVerifyOtpServiceProvider(
  optionsOverrides?: Pick<AuthVerifyOptions, 'otpService'>,
): Provider {
  return {
    provide: AuthVerifyOtpService,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: Pick<AuthVerifyOptions, 'otpService'>) =>
      optionsOverrides?.otpService ?? options.otpService,
  };
}

export function createAuthVerifyEmailServiceProvider(
  optionsOverrides?: Pick<AuthVerifyOptions, 'emailService'>,
): Provider {
  return {
    provide: AuthVerifyEmailService,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: Pick<AuthVerifyOptions, 'emailService'>) =>
      optionsOverrides?.emailService ?? options.emailService,
  };
}

export function createAuthVerifyUserModelServiceProvider(
  optionsOverrides?: Pick<AuthVerifyOptions, 'userModelService'>,
): Provider {
  return {
    provide: AuthVerifyUserModelService,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: Pick<AuthVerifyOptions, 'userModelService'>) =>
      optionsOverrides?.userModelService ?? options.userModelService,
  };
}

export function createAuthVerifyNotificationServiceProvider(
  optionsOverrides?: Pick<AuthVerifyOptions, 'notificationService'>,
): Provider {
  return {
    provide: AuthVerifyNotificationService,
    inject: [
      RAW_OPTIONS_TOKEN,
      AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
      AuthVerifyEmailService,
    ],
    useFactory: async (
      options: Pick<AuthVerifyOptions, 'notificationService'>,
      settings: AuthVerifySettingsInterface,
      emailService: AuthVerifyEmailServiceInterface,
    ) =>
      optionsOverrides?.notificationService ??
      options.notificationService ??
      new AuthVerifyNotificationService(settings, emailService),
  };
}
