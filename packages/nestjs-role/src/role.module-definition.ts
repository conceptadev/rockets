import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  RepositoryInterface,
  RoleAssignmentInterface,
  createSettingsProvider,
  getDynamicRepositoryToken,
  RoleEntityInterface,
} from '@concepta/nestjs-common';

import {
  ROLE_MODULE_REPOSITORIES_TOKEN,
  ROLE_MODULE_ROLE_ENTITY_KEY,
  ROLE_MODULE_SETTINGS_TOKEN,
} from './role.constants';

import { RoleOptionsInterface } from './interfaces/role-options.interface';
import { RoleOptionsExtrasInterface } from './interfaces/role-options-extras.interface';
import { RoleSettingsInterface } from './interfaces/role-settings.interface';

import { RoleService } from './services/role.service';
import { RoleModelService } from './services/role-model.service';

import { roleDefaultConfig } from './config/role-default.config';
import { RoleMissingEntitiesOptionsException } from './exceptions/role-missing-entities-options.exception';

const RAW_OPTIONS_TOKEN = Symbol('__ROLE_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: RoleModuleClass,
  OPTIONS_TYPE: ROLE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: ROLE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RoleOptionsInterface>({
  moduleName: 'Role',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<RoleOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

export type RoleOptions = Omit<typeof ROLE_OPTIONS_TYPE, 'global'>;
export type RoleAsyncOptions = Omit<typeof ROLE_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: RoleOptionsExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;
  const { global = false, entities } = extras;

  if (!entities) {
    throw new RoleMissingEntitiesOptionsException();
  }

  return {
    ...definition,
    global,
    imports: createRoleImports({ imports, entities }),
    providers: createRoleProviders({ entities, providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createRoleExports()],
  };
}

export function createRoleImports(
  options: Pick<DynamicModule, 'imports'> &
    Pick<RoleOptionsExtrasInterface, 'entities'>,
): DynamicModule['imports'] {
  return [
    ...(options.imports ?? []),
    ConfigModule.forFeature(roleDefaultConfig),
  ];
}

export function createRoleProviders(
  options: {
    overrides?: RoleOptions;
    providers?: Provider[];
  } & Pick<RoleOptionsExtrasInterface, 'entities'>,
): Provider[] {
  return [
    ...(options.providers ?? []),
    createRoleSettingsProvider(options.overrides),
    createRoleModelServiceProvider(options.overrides),
    ...createRoleRepositoriesProviders({
      entities: options.overrides?.entities ?? options.entities,
    }),
    RoleService,
  ];
}

export function createRoleExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    ROLE_MODULE_SETTINGS_TOKEN,
    ROLE_MODULE_REPOSITORIES_TOKEN,
    RoleService,
    RoleModelService,
  ];
}

export function createRoleSettingsProvider(
  optionsOverrides?: RoleOptions,
): Provider {
  return createSettingsProvider<RoleSettingsInterface, RoleOptionsInterface>({
    settingsToken: ROLE_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: roleDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createRoleModelServiceProvider(
  optionsOverrides?: RoleOptions,
): Provider {
  return {
    provide: RoleModelService,
    inject: [
      RAW_OPTIONS_TOKEN,
      getDynamicRepositoryToken(ROLE_MODULE_ROLE_ENTITY_KEY),
    ],
    useFactory: async (
      options: RoleOptionsInterface,
      roleRepo: RepositoryInterface<RoleEntityInterface>,
    ) =>
      optionsOverrides?.roleModelService ??
      options.roleModelService ??
      new RoleModelService(roleRepo),
  };
}

export function createRoleRepositoriesProviders(
  options: Pick<RoleOptionsExtrasInterface, 'entities'>,
): Provider[] {
  const { entities } = options;

  const reposToInject = [];
  const keyTracker: Record<string, number> = {};

  let repoIdx = 0;

  // add role entity
  reposToInject[repoIdx] = getDynamicRepositoryToken(
    ROLE_MODULE_ROLE_ENTITY_KEY,
  );
  keyTracker[ROLE_MODULE_ROLE_ENTITY_KEY] = repoIdx++;

  // now get all role assignments
  if (entities) {
    for (const entityKey of entities) {
      reposToInject[repoIdx] = getDynamicRepositoryToken(entityKey);
      keyTracker[entityKey] = repoIdx++;
    }
  }

  return [
    {
      provide: ROLE_MODULE_REPOSITORIES_TOKEN,
      useFactory: (
        ...args: RepositoryInterface<
          RoleEntityInterface | RoleAssignmentInterface
        >[]
      ) => {
        const repoInstances: Record<
          string,
          RepositoryInterface<RoleEntityInterface | RoleAssignmentInterface>
        > = {};

        // Add the role repository
        repoInstances[ROLE_MODULE_ROLE_ENTITY_KEY] =
          args[keyTracker[ROLE_MODULE_ROLE_ENTITY_KEY]];

        // Add all assignment repositories
        if (entities) {
          for (const entityKey of entities) {
            repoInstances[entityKey] = args[keyTracker[entityKey]];
          }
        }

        return repoInstances;
      },
      inject: reposToInject,
    },
  ];
}
