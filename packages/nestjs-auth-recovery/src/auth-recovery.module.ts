import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@concepta/nestjs-core';

import { authRecoveryDefaultConfig } from './config/auth-recovery-default.config';
import { AuthRecoveryOptionsInterface } from './interfaces/auth-recovery-options.interface';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthRecoveryController } from './auth-recovery.controller';
import {
  AUTH_RECOVERY_EMAIL_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_OPTIONS_TOKEN,
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AUTH_RECOVERY_OTP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_RECOVERY_USER_MUTATE_SERVICE_TOKEN,
} from './auth-recovery.constants';
import { AuthRecoveryNotificationService } from './services/auth-recovery-notification.service';

@Module({
  providers: [AuthRecoveryService, AuthRecoveryNotificationService],
  controllers: [AuthRecoveryController],
  exports: [AuthRecoveryService],
})
export class AuthRecoveryModule extends createConfigurableDynamicRootModule<
  AuthRecoveryModule,
  AuthRecoveryOptionsInterface
>(AUTH_RECOVERY_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(authRecoveryDefaultConfig)],
  providers: [
    {
      provide: AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
      inject: [
        AUTH_RECOVERY_MODULE_OPTIONS_TOKEN,
        authRecoveryDefaultConfig.KEY,
      ],
      useFactory: async (
        options: AuthRecoveryOptionsInterface,
        defaultSettings: ConfigType<typeof authRecoveryDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: AUTH_RECOVERY_OTP_SERVICE_TOKEN,
      inject: [AUTH_RECOVERY_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: AuthRecoveryOptionsInterface) =>
        options.otpService,
    },
    {
      provide: AUTH_RECOVERY_EMAIL_SERVICE_TOKEN,
      inject: [AUTH_RECOVERY_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: AuthRecoveryOptionsInterface) =>
        options.emailService,
    },
    {
      provide: AUTH_RECOVERY_USER_LOOKUP_SERVICE_TOKEN,
      inject: [AUTH_RECOVERY_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: AuthRecoveryOptionsInterface) =>
        options.userLookupService,
    },
    {
      provide: AUTH_RECOVERY_USER_MUTATE_SERVICE_TOKEN,
      inject: [AUTH_RECOVERY_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: AuthRecoveryOptionsInterface) =>
        options.userMutateService,
    },
  ],
}) {
  static register(options: AuthRecoveryOptionsInterface) {
    const module = AuthRecoveryModule.forRoot(AuthRecoveryModule, options);

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthRecoveryOptionsInterface> &
      ModuleOptionsControllerInterface,
  ) {
    const module = AuthRecoveryModule.forRootAsync(AuthRecoveryModule, options);

    negotiateController(module, options);

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthRecoveryModule, AuthRecoveryOptionsInterface>(
      AuthRecoveryModule,
      options,
    );
  }
}
