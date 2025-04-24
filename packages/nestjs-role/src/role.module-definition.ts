import { Repository } from 'typeorm';
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
} from '@concepta/nestjs-common';

import {
  TypeOrmExtModule,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-typeorm-ext';

import {
  ROLE_MODULE_CRUD_SERVICES_TOKEN,
  ROLE_MODULE_REPOSITORIES_TOKEN,
  ROLE_MODULE_ROLE_ENTITY_KEY,
  ROLE_MODULE_SETTINGS_TOKEN,
} from './role.constants';

import { RoleOptionsInterface } from './interfaces/role-options.interface';
import { RoleOptionsExtrasInterface } from './interfaces/role-options-extras.interface';
import { RoleEntitiesOptionsInterface } from './interfaces/role-entities-options.interface';
import { RoleEntityInterface } from './interfaces/role-entity.interface';
import { RoleSettingsInterface } from './interfaces/role-settings.interface';

import { RoleService } from './services/role.service';
import { RoleModelService } from './services/role-model.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleController } from './role.controller';
import { RoleAssignmentController } from './role-assignment.controller';
import { RoleAssignmentCrudService } from './services/role-assignment-crud.service';
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
  const { controllers, global = false, entities } = extras;

  if (!entities) {
    throw new RoleMissingEntitiesOptionsException();
  }

  return {
    ...definition,
    global,
    imports: createRoleImports({ imports, entities }),
    providers: createRoleProviders({ entities, providers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createRoleExports()],
    controllers: createRoleControllers({ controllers }),
  };
}

export function createRoleImports(
  options: Pick<DynamicModule, 'imports'> & RoleEntitiesOptionsInterface,
): DynamicModule['imports'] {
  return [
    ...(options.imports ?? []),
    ConfigModule.forFeature(roleDefaultConfig),
    TypeOrmExtModule.forFeature(options.entities),
  ];
}

export function createRoleProviders(
  options: RoleEntitiesOptionsInterface & {
    overrides?: RoleOptions;
    providers?: Provider[];
  },
): Provider[] {
  return [
    ...(options.providers ?? []),
    createRoleSettingsProvider(options.overrides),
    createRoleModelServiceProvider(options.overrides),
    ...createRoleRepositoriesProviders({
      entities: options.overrides?.entities ?? options.entities,
    }),
    RoleService,
    RoleCrudService,
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
    RoleCrudService,
  ];
}

export function createRoleControllers(
  overrides: Pick<RoleOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [RoleController, RoleAssignmentController];
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
  options: RoleEntitiesOptionsInterface,
): Provider[] {
  const { entities } = options;

  const reposToInject = [];
  const keyTracker: Record<string, number> = {};

  let repoIdx = 0;

  for (const entityKey in entities) {
    reposToInject[repoIdx] = getDynamicRepositoryToken(entityKey);
    keyTracker[entityKey] = repoIdx++;
  }

  return [
    {
      provide: ROLE_MODULE_REPOSITORIES_TOKEN,

      useFactory: (...args: RepositoryInterface<RoleAssignmentInterface>[]) => {
        const repoInstances: Record<
          string,
          RepositoryInterface<RoleAssignmentInterface>
        > = {};

        for (const entityKey in entities) {
          repoInstances[entityKey] = args[keyTracker[entityKey]];
        }

        return repoInstances;
      },
      inject: reposToInject,
    },
    {
      // TODO: TYPEORM CRUD NEEDS TYPEORM
      provide: ROLE_MODULE_CRUD_SERVICES_TOKEN,
      useFactory: (...args: Repository<RoleAssignmentInterface>[]) => {
        const serviceInstances: Record<string, RoleAssignmentCrudService> = {};

        for (const entityKey in entities) {
          serviceInstances[entityKey] = new RoleAssignmentCrudService(
            args[keyTracker[entityKey]],
          );
        }

        return serviceInstances;
      },
      inject: reposToInject,
    },
  ];
}
