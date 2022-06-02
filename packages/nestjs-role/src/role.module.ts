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
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { roleDefaultConfig } from './config/role-default.config';
import { RoleOptionsInterface } from './interfaces/role-options.interface';
import { RoleOrmOptionsInterface } from './interfaces/role-entities-options.interface';
import {
  ALL_ROLES_REPOSITORIES_TOKEN,
  ROLE_MODULE_OPTIONS_TOKEN,
  ROLE_MODULE_SETTINGS_TOKEN,
} from './role.constants';
import { RoleController } from './role.controller';
import { RoleLookupService } from './services/role-lookup.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleLookupServiceInterface } from './interfaces/role-lookup-service.interface';
import { DefaultRoleLookupService } from './services/default-role-lookup.service';
import { RoleMutateService } from './services/role-mutate.service';
import { DefaultRoleMutateService } from './services/default-role-mutate.service';

/**
 * Role Module
 */
@Module({
  providers: [
    DefaultRoleLookupService,
    DefaultRoleMutateService,
    RoleCrudService,
  ],
  exports: [RoleLookupService, RoleMutateService, RoleCrudService],
  controllers: [RoleController],
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
      RoleOrmOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = RoleModule.forRoot(RoleModule, options);

    module.providers.push(this.getAllProviders(options.entities));

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
      RoleOrmOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = RoleModule.forRootAsync(RoleModule, {
      useFactory: () => ({}),
      ...options,
    });

    module.providers.push(this.getAllProviders(options.entities));

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
    entities: RoleOrmOptionsInterface['entities'],
  ) {
    const reposToInject = [];
    const keyTracker = {};

    for (const entityKey in entities) {
      let idx = 0;
      reposToInject[idx] = getDynamicRepositoryToken(entityKey);
      keyTracker[entityKey] = idx++;
    }

    return {
      provide: ALL_ROLES_REPOSITORIES_TOKEN,
      useFactory: (...args) => {
        const repoInstances = {};

        for (const entityKey in entities) {
          repoInstances[entityKey] = args[keyTracker[entityKey]];
        }

        return repoInstances;
      },
      inject: reposToInject,
    };
  }
}
