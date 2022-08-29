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
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OPTIONS_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from './invitation.constants';

import { invitationDefaultConfig } from './config/invitation-default.config';
import { InvitationOptionsInterface } from './interfaces/invitation-options.interface';
import { InvitationService } from './services/invitation.service';
import { InvitationController } from './controllers/invitation.controller';
import { InvitationCrudService } from './services/invitation-crud.service';
import { InvitationEntitiesOptionsInterface } from './interfaces/invitation-entities-options.interface';
import { InvitationAcceptanceService } from './services/invitation-acceptance.service';
import { InvitationAcceptanceController } from './controllers/invitation-acceptance.controller';
import { InvitationRevocationService } from './services/invitation-revocation.service';
import { InvitationSendService } from './services/invitation-send.service';

@Module({
  providers: [
    InvitationService,
    InvitationCrudService,
    InvitationAcceptanceService,
    InvitationSendService,
    InvitationRevocationService,
  ],
  controllers: [InvitationController, InvitationAcceptanceController],
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
      provide: INVITATION_MODULE_OTP_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.otpService,
    },
    {
      provide: INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.emailService,
    },
    {
      provide: INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.userLookupService,
    },
    {
      provide: INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
      inject: [INVITATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: InvitationOptionsInterface) =>
        options.userMutateService,
    },
  ],
}) {
  static register(
    options: InvitationOptionsInterface & InvitationEntitiesOptionsInterface,
  ) {
    const module = InvitationModule.forRoot(InvitationModule, options);

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<InvitationOptionsInterface> &
      InvitationEntitiesOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = InvitationModule.forRootAsync(InvitationModule, options);

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

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
