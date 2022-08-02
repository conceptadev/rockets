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
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { invitationDefaultConfig } from './config/invitation-default.config';
import { InvitationOptionsInterface } from './interfaces/invitation-options.interface';
import { InvitationService } from './services/invitation.service';
import { InvitationController } from './controllers/invitation.controller';
import {
  INVITATION_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OPTIONS_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_OTP_SERVICE_TOKEN,
  INVITATION_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_USER_MUTATE_SERVICE_TOKEN,
} from './invitation.constants';
import { InvitationNotificationService } from './services/invitation-notification.service';
import { InvitationCrudService } from './services/invitation-crud.service';
import { InvitationEntitiesOptionsInterface } from './interfaces/invitation-entities-options.interface';
import { InvitationEventService } from './services/invitation-event.service';
import { InvitationValidationController } from './controllers/invitation-validation.controller';
import { EventModule, EventOptionsInterface } from '@concepta/nestjs-event';

const eventConfig: EventOptionsInterface = {
  emitter: {},
};

@Module({
  providers: [
    InvitationService,
    InvitationCrudService,
    InvitationNotificationService,
    InvitationEventService,
  ],
  controllers: [InvitationController, InvitationValidationController],
  exports: [InvitationService],
})
export class InvitationModule extends createConfigurableDynamicRootModule<
  InvitationModule,
  InvitationOptionsInterface
>(INVITATION_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(invitationDefaultConfig),
    CrudModule.deferred({
      timeoutMessage:
        'UserModule requires CrudModule to be registered in your application.',
    }),
    EventModule.register(eventConfig),
  ],
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
