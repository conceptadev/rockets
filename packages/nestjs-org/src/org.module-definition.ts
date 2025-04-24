import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { RepositoryInterface } from '@concepta/nestjs-common';
import {
  ORG_MODULE_SETTINGS_TOKEN,
  ORG_MODULE_ORG_ENTITY_KEY,
} from './org.constants';
import { OrgOptionsInterface } from './interfaces/org-options.interface';
import { OrgOptionsExtrasInterface } from './interfaces/org-options-extras.interface';
import { OrgEntitiesOptionsInterface } from './interfaces/org-entities-options.interface';
import { OrgSettingsInterface } from './interfaces/org-settings.interface';
import { OrgEntityInterface } from './interfaces/org-entity.interface';
import { OrgModelService } from './services/org-model.service';
import { OrgCrudService } from './services/org-crud.service';
import { OrgMemberService } from './services/org-member.service';
import { OrgMemberModelService } from './services/org-member-model.service';
import { OrgController } from './org.controller';
import { orgDefaultConfig } from './config/org-default.config';
import { InvitationAcceptedListener } from './listeners/invitation-accepted-listener';
import { OrgMissingEntitiesOptionsException } from './exceptions/org-missing-entities-options.exception';

const RAW_OPTIONS_TOKEN = Symbol('__ORG_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: OrgModuleClass,
  OPTIONS_TYPE: ORG_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: ORG_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<OrgOptionsInterface>({
  moduleName: 'Org',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<OrgOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

export type OrgOptions = Omit<typeof ORG_OPTIONS_TYPE, 'global'>;
export type OrgAsyncOptions = Omit<typeof ORG_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: OrgOptionsExtrasInterface,
): DynamicModule {
  const { providers = [] } = definition;
  const {
    global = false,
    entities,
    controllers,
    extraControllers = [],
    extraProviders = [],
  } = extras;

  if (!entities) {
    throw new OrgMissingEntitiesOptionsException();
  }

  return {
    ...definition,
    global,
    imports: createOrgImports({ entities }),
    providers: createOrgProviders({ providers, extraProviders }),
    controllers: createOrgControllers({ controllers, extraControllers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createOrgExports()],
  };
}

export function createOrgImports(
  options: OrgEntitiesOptionsInterface,
): DynamicModule['imports'] {
  return [
    ConfigModule.forFeature(orgDefaultConfig),
    TypeOrmExtModule.forFeature(options.entities),
  ];
}

export function createOrgProviders(options: {
  overrides?: OrgOptions;
  providers?: Provider[];
  extraProviders?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    ...(options.extraProviders ?? []),
    OrgCrudService,
    OrgMemberService,
    OrgMemberModelService,
    InvitationAcceptedListener,
    createOrgSettingsProvider(options.overrides),
    createOrgModelServiceProvider(options.overrides),
  ];
}

export function createOrgExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    ORG_MODULE_SETTINGS_TOKEN,
    OrgModelService,
    OrgCrudService,
    OrgMemberService,
    OrgMemberModelService,
  ];
}

export function createOrgControllers(
  overrides: Pick<OrgOptions, 'controllers' | 'extraControllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers?.length
    ? overrides.controllers
    : [OrgController, ...(overrides.extraControllers ?? [])];
}

export function createOrgSettingsProvider(
  optionsOverrides?: OrgOptions,
): Provider {
  return createSettingsProvider<OrgSettingsInterface, OrgOptionsInterface>({
    settingsToken: ORG_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: orgDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createOrgModelServiceProvider(
  optionsOverrides?: OrgOptions,
): Provider {
  return {
    provide: OrgModelService,
    inject: [
      RAW_OPTIONS_TOKEN,
      getDynamicRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
    ],
    useFactory: async (
      options: OrgOptionsInterface,
      orgRepo: RepositoryInterface<OrgEntityInterface>,
    ) =>
      optionsOverrides?.orgModelService ??
      options.orgModelService ??
      new OrgModelService(orgRepo),
  };
}
