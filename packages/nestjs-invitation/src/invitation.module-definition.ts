import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { createSettingsProvider } from '@concepta/nestjs-common';

import {
  INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_SETTINGS_TOKEN,
  INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from './invitation.constants';

import { InvitationOptionsInterface } from './interfaces/invitation-options.interface';
import { InvitationOptionsExtrasInterface } from './interfaces/invitation-options-extras.interface';
import { InvitationEntitiesOptionsInterface } from './interfaces/invitation-entities-options.interface';
import { InvitationSettingsInterface } from './interfaces/invitation-settings.interface';
import { InvitationController } from './controllers/invitation.controller';
import { InvitationAcceptanceController } from './controllers/invitation-acceptance.controller';
import { InvitationService } from './services/invitation.service';
import { InvitationCrudService } from './services/invitation-crud.service';
import { InvitationAcceptanceService } from './services/invitation-acceptance.service';
import { InvitationSendService } from './services/invitation-send.service';
import { InvitationRevocationService } from './services/invitation-revocation.service';
import { invitationDefaultConfig } from './config/invitation-default.config';
import { InvitationReattemptController } from './controllers/invitation-reattempt.controller';
import { InvitationMutateService } from './services/invitation-mutate.service';
import { InvitationEmailServiceInterface } from './interfaces/invitation-email.service.interface';
import { InvitationOtpServiceInterface } from './interfaces/invitation-otp.service.interface';

const RAW_OPTIONS_TOKEN = Symbol('__INVITATION_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: InvitationModuleClass,
  OPTIONS_TYPE: INVITATION_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: INVITATION_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<InvitationOptionsInterface>({
  moduleName: 'Invitation',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<InvitationOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type InvitationOptions = Omit<typeof INVITATION_OPTIONS_TYPE, 'global'>;
export type InvitationAsyncOptions = Omit<
  typeof INVITATION_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: InvitationOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const { controllers, entities, global = false } = extras;

  if (!entities) {
    throw new Error('You must provide the entities option');
  }

  return {
    ...definition,
    global,
    imports: createInvitationImports({ entities }),
    providers: createInvitationProviders({ providers }),
    controllers: createInvitationControllers({ controllers }),
    exports: [
      ConfigModule,
      RAW_OPTIONS_TOKEN,
      ...(createInvitationExports() ?? []),
    ],
  };
}

export function createInvitationImports(
  options: InvitationEntitiesOptionsInterface,
): DynamicModule['imports'] {
  return [
    ConfigModule.forFeature(invitationDefaultConfig),
    TypeOrmExtModule.forFeature(options.entities),
  ];
}

export function createInvitationExports(): DynamicModule['exports'] {
  return [
    INVITATION_MODULE_SETTINGS_TOKEN,
    INVITATION_MODULE_OTP_SERVICE_TOKEN,
    INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
    INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
    InvitationService,
    InvitationMutateService,
  ];
}

export function createInvitationProviders(options: {
  overrides?: InvitationOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    InvitationService,
    InvitationCrudService,
    InvitationAcceptanceService,
    InvitationRevocationService,
    InvitationMutateService,
    createInvitationSettingsProvider(options.overrides),
    createInvitationOtpServiceProvider(options.overrides),
    createInvitationEmailServiceProvider(options.overrides),
    createInvitationUserLookupServiceProvider(options.overrides),
    createInvitationUserMutateServiceProvider(options.overrides),
    createInvitationSendServiceProvider(options.overrides),
  ];
}

export function createInvitationControllers(
  overrides: Pick<InvitationOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [
        InvitationController,
        InvitationAcceptanceController,
        InvitationReattemptController,
      ];
}

export function createInvitationSettingsProvider(
  optionsOverrides?: InvitationOptions,
): Provider {
  return createSettingsProvider<
    InvitationSettingsInterface,
    InvitationOptionsInterface
  >({
    settingsToken: INVITATION_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: invitationDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createInvitationOtpServiceProvider(
  optionsOverrides?: InvitationOptions,
): Provider {
  return {
    provide: INVITATION_MODULE_OTP_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: InvitationOptionsInterface) =>
      optionsOverrides?.otpService ?? options.otpService,
  };
}

export function createInvitationEmailServiceProvider(
  optionsOverrides?: InvitationOptions,
): Provider {
  return {
    provide: INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: InvitationOptionsInterface) =>
      optionsOverrides?.emailService ?? options.emailService,
  };
}

export function createInvitationUserLookupServiceProvider(
  optionsOverrides?: InvitationOptions,
): Provider {
  return {
    provide: INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: InvitationOptionsInterface) =>
      optionsOverrides?.userLookupService ?? options.userLookupService,
  };
}

export function createInvitationUserMutateServiceProvider(
  optionsOverrides?: InvitationOptions,
): Provider {
  return {
    provide: INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: InvitationOptionsInterface) =>
      optionsOverrides?.userMutateService ?? options.userMutateService,
  };
}

export function createInvitationSendServiceProvider(
  optionsOverrides?: InvitationOptions,
): Provider {
  return {
    provide: InvitationSendService,
    inject: [
      RAW_OPTIONS_TOKEN,
      INVITATION_MODULE_SETTINGS_TOKEN,
      INVITATION_MODULE_EMAIL_SERVICE_TOKEN,
      INVITATION_MODULE_OTP_SERVICE_TOKEN,
      InvitationMutateService,
    ],
    useFactory: async (
      options: InvitationOptionsInterface,
      settings: InvitationSettingsInterface,
      emailService: InvitationEmailServiceInterface,
      otpService: InvitationOtpServiceInterface,
      invitationMutateService: InvitationMutateService,
    ) =>
      optionsOverrides?.invitationSendService ??
      options.invitationSendService ??
      new InvitationSendService(
        settings,
        emailService,
        otpService,
        invitationMutateService,
      ),
  };
}
