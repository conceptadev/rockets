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

import { invitationDefaultConfig } from './config/invitation-default.config';
import { InvitationOptionsInterface } from './interfaces/invitation-options.interface';
import { InvitationService } from './services/invitation.service';
import { InvitationController } from './invitation.controller';
import {
  INVITATION_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OPTIONS_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_OTP_SERVICE_TOKEN,
  INVITATION_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_USER_MUTATE_SERVICE_TOKEN,
} from './invitation.constants';
import { InvitationNotificationService } from './services/invitation-notification.service';

@Module({
  providers: [InvitationService, InvitationNotificationService],
  controllers: [InvitationController],
  exports: [InvitationService],
})
export class InvitationModule extends createConfigurableDynamicRootModule<
  InvitationModule,
  InvitationOptionsInterface
>(INVITATION_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(invitationDefaultConfig)],
  providers: [
    {
      provide: INVITATION_MODULE_SETTINGS_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN, invitationDefaultConfig.KEY],
      useFactory: async (
        options: InvitationOptionsInterface,
        defaultSettings: ConfigType<typeof invitationDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: INVITATION_OTP_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.otpService,
    },
    {
      provide: INVITATION_EMAIL_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.emailService,
    },
    {
      provide: INVITATION_USER_LOOKUP_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.userLookupService,
    },
    {
      provide: INVITATION_USER_MUTATE_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.userMutateService,
    },
  ],
}) {
  static register(options: InvitationOptionsInterface) {
    const module = InvitationModule.forRoot(InvitationModule, options);

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<InvitationOptionsInterface> &
      ModuleOptionsControllerInterface,
  ) {
    const module = InvitationModule.forRootAsync(InvitationModule, options);

    negotiateController(module, options);

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<InvitationModule, InvitationOptionsInterface>(
      InvitationModule,
      options,
    );
  }
}
