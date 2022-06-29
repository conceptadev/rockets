import { Repository } from 'typeorm';
import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@concepta/nestjs-core';
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { RoleAssignmentInterface } from '@concepta/ts-common';
import {
  ROLE_MODULE_CRUD_SERVICES_TOKEN,
  ROLE_MODULE_REPOSITORIES_TOKEN,
  ROLE_MODULE_OPTIONS_TOKEN,
  ROLE_MODULE_SETTINGS_TOKEN,
} from './role.constants';
import { roleDefaultConfig } from './config/role-default.config';
import { RoleOptionsInterface } from './interfaces/role-options.interface';
import { RoleEntitiesOptionsInterface } from './interfaces/role-entities-options.interface';
import { RoleController } from './role.controller';
import { RoleService } from './services/role.service';
import { RoleLookupService } from './services/role-lookup.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleLookupServiceInterface } from './interfaces/role-lookup-service.interface';
import { DefaultRoleLookupService } from './services/default-role-lookup.service';
import { RoleMutateService } from './services/role-mutate.service';
import { DefaultRoleMutateService } from './services/default-role-mutate.service';
import { RoleAssignmentCrudService } from './services/role-assignment-crud.service';
import { RoleAssignmentController } from './role-assignment.controller';

/**
 * Role Module
 */
@Module({
  providers: [
    DefaultRoleLookupService,
    DefaultRoleMutateService,
    RoleService,
    RoleCrudService,
  ],
  exports: [RoleService, RoleLookupService, RoleMutateService, RoleCrudService],
  controllers: [RoleController, RoleAssignmentController],
})
export class RoleModule extends createConfigurableDynamicRootModule<
  RoleModule,
  RoleOptionsInterface
>(ROLE_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(roleDefaultConfig),
    CrudModule.deferred({
      timeoutMessage:
        'RoleModule requires CrudModule to be registered in your application.',
    }),
  ],
  providers: [
    {
      provide: ROLE_MODULE_SETTINGS_TOKEN,
      inject: [ROLE_MODULE_OPTIONS_TOKEN, roleDefaultConfig.KEY],
      useFactory: async (
        options: RoleOptionsInterface,
        defaultSettings: ConfigType<typeof roleDefaultConfig>,
      ) => options.settings ?? defaultSettings,
    },
    {
      provide: RoleLookupService,
      inject: [ROLE_MODULE_OPTIONS_TOKEN, DefaultRoleLookupService],
      useFactory: async (
        options: RoleOptionsInterface,
        defaultService: RoleLookupServiceInterface,
      ) => options.roleLookupService ?? defaultService,
    },
    {
      provide: RoleMutateService,
      inject: [ROLE_MODULE_OPTIONS_TOKEN, DefaultRoleMutateService],
      useFactory: async (
        options: RoleOptionsInterface,
        defaultService: DefaultRoleMutateService,
      ) => options.roleMutateService ?? defaultService,
    },
  ],
}) {
  /**
   * Register the Role module synchronously.
   *
   * @param options module options
   */
  static register(
    options: RoleOptionsInterface &
      RoleEntitiesOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = RoleModule.forRoot(RoleModule, options);

    const allProviders = this.getAllProviders(options.entities);

    if (module.providers) {
      module.providers = module.providers.concat(allProviders);
    } else {
      module.providers = allProviders;
    }

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

    negotiateController(module, options);

    return module;
  }

  /**
   * Register the Role module asynchronously.
   *
   * @param options module options
   */
  static registerAsync(
    options: AsyncModuleConfig<RoleOptionsInterface> &
      RoleEntitiesOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = RoleModule.forRootAsync(RoleModule, options);

    const allProviders = this.getAllProviders(options.entities);

    if (module.providers) {
      module.providers = module.providers.concat(allProviders);
    } else {
      module.providers = allProviders;
    }

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

    negotiateController(module, options);

    return module;
  }

  /**
   * Expect another module to have registered the Role module.
   *
   * @param options module defer options
   */
  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<RoleModule, RoleOptionsInterface>(RoleModule, options);
  }

  private static getAllProviders(
    entities: RoleEntitiesOptionsInterface['entities'],
  ): Provider[] {
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
        useFactory: (...args: Repository<RoleAssignmentInterface>[]) => {
          const repoInstances: Record<
            string,
            Repository<RoleAssignmentInterface>
          > = {};

          for (const entityKey in entities) {
            repoInstances[entityKey] = args[keyTracker[entityKey]];
          }

          return repoInstances;
        },
        inject: reposToInject,
      },
      {
        provide: ROLE_MODULE_CRUD_SERVICES_TOKEN,
        useFactory: (...args: Repository<RoleAssignmentInterface>[]) => {
          const serviceInstances: Record<string, RoleAssignmentCrudService> =
            {};

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
}
