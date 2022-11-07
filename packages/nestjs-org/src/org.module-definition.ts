import { Repository } from 'typeorm';
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

import {
  ORG_MODULE_SETTINGS_TOKEN,
  ORG_MODULE_OWNER_LOOKUP_SERVICE_TOKEN,
  ORG_MODULE_ORG_ENTITY_KEY,
} from './org.constants';
import { OrgOptionsInterface } from './interfaces/org-options.interface';
import { OrgOptionsExtrasInterface } from './interfaces/org-options-extras.interface';
import { OrgEntitiesOptionsInterface } from './interfaces/org-entities-options.interface';
import { OrgSettingsInterface } from './interfaces/org-settings.interface';
import { OrgEntityInterface } from './interfaces/org-entity.interface';
import { OrgOwnerLookupServiceInterface } from './interfaces/org-owner-lookup-service.interface';
import { OrgLookupService } from './services/org-lookup.service';
import { OrgMutateService } from './services/org-mutate.service';
import { OrgCrudService } from './services/org-crud.service';
import { OrgController } from './org.controller';
import { orgDefaultConfig } from './config/org-default.config';
import { InvitationAcceptedListener } from './listeners/invitation-accepted-listener';

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
  const { controllers, global = false, entities } = extras;

  if (!entities) {
    throw new Error('You must provide the entities option');
  }

  return {
    ...definition,
    global,
    imports: createOrgImports({ entities }),
    providers: createOrgProviders({ providers }),
    controllers: createOrgControllers({ controllers }),
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
}): Provider[] {
  return [
    ...(options.providers ?? []),
    OrgCrudService,
    InvitationAcceptedListener,
    createOrgSettingsProvider(options.overrides),
    createOrgOwnerLookupServiceProvider(options.overrides),
    createOrgLookupServiceProvider(options.overrides),
    createOrgMutateServiceProvider(options.overrides),
  ];
}

export function createOrgExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    ORG_MODULE_SETTINGS_TOKEN,
    ORG_MODULE_OWNER_LOOKUP_SERVICE_TOKEN,
    OrgLookupService,
    OrgMutateService,
    OrgCrudService,
  ];
}

export function createOrgControllers(
  overrides: Pick<OrgOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [OrgController];
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

export function createOrgOwnerLookupServiceProvider(
  optionsOverrides?: OrgOptions,
): Provider {
  return {
    provide: ORG_MODULE_OWNER_LOOKUP_SERVICE_TOKEN,
    inject: [RAW_OPTIONS_TOKEN],
    useFactory: async (options: OrgOptionsInterface) =>
      optionsOverrides?.ownerLookupService ?? options.ownerLookupService,
  };
}

export function createOrgLookupServiceProvider(
  optionsOverrides?: OrgOptions,
): Provider {
  return {
    provide: OrgLookupService,
    inject: [
      RAW_OPTIONS_TOKEN,
      getDynamicRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
      ORG_MODULE_OWNER_LOOKUP_SERVICE_TOKEN,
    ],
    useFactory: async (
      options: OrgOptionsInterface,
      orgRepo: Repository<OrgEntityInterface>,
      ownerLookupService: OrgOwnerLookupServiceInterface,
    ) =>
      optionsOverrides?.orgLookupService ??
      options.orgLookupService ??
      new OrgLookupService(orgRepo, ownerLookupService),
  };
}

export function createOrgMutateServiceProvider(
  optionsOverrides?: OrgOptions,
): Provider {
  return {
    provide: OrgMutateService,
    inject: [
      RAW_OPTIONS_TOKEN,
      getDynamicRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
    ],
    useFactory: async (
      options: OrgOptionsInterface,
      orgRepo: Repository<OrgEntityInterface>,
    ) =>
      optionsOverrides?.orgLookupService ??
      options.orgLookupService ??
      new OrgMutateService(orgRepo),
  };
}
