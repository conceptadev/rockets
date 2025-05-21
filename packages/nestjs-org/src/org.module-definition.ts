import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createSettingsProvider } from '@concepta/nestjs-common';
import {
  RepositoryInterface,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-common';
import {
  ORG_MODULE_SETTINGS_TOKEN,
  ORG_MODULE_ORG_ENTITY_KEY,
} from './org.constants';
import { OrgOptionsInterface } from './interfaces/org-options.interface';
import { OrgOptionsExtrasInterface } from './interfaces/org-options-extras.interface';
import { OrgSettingsInterface } from './interfaces/org-settings.interface';
import { OrgEntityInterface } from '@concepta/nestjs-common';
import { OrgModelService } from './services/org-model.service';
import { OrgMemberService } from './services/org-member.service';
import { OrgMemberModelService } from './services/org-member-model.service';

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
  const { imports, providers = [] } = definition;
  const { global = false } = extras;

  return {
    ...definition,
    global,
    imports: createOrgImports({ imports }),
    providers: createOrgProviders({ providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createOrgExports()],
  };
}

export function createOrgImports(options: {
  imports: DynamicModule['imports'];
}): DynamicModule['imports'] {
  return [
    ...(options.imports || []),
    ConfigModule.forFeature(orgDefaultConfig),
  ];
}

export function createOrgProviders(options: {
  overrides?: OrgOptions;
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
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
    OrgMemberService,
    OrgMemberModelService,
  ];
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
