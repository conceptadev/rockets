import { DynamicModule, Module } from '@nestjs/common';

import {
  RoleAsyncOptions,
  RoleModuleClass,
  RoleOptions,
  createRoleImports,
  createRoleProviders,
  createRoleExports,
  createRoleControllers,
} from './role.module-definition';

import { RoleService } from './services/role.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleLookupService } from './services/role-lookup.service';
import { RoleMutateService } from './services/role-mutate.service';
import { RoleController } from './role.controller';
import { RoleAssignmentController } from './role-assignment.controller';

/**
 * Role Module
 */
@Module({
  providers: [
    RoleService,
    RoleLookupService,
    RoleMutateService,
    RoleCrudService,
  ],
  exports: [RoleService, RoleLookupService, RoleMutateService, RoleCrudService],
  controllers: [RoleController, RoleAssignmentController],
})
export class RoleModule extends RoleModuleClass {
  static register(options: RoleOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: RoleAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: RoleOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: RoleAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: RoleOptions): DynamicModule {
    const { entities } = options;

    if (!entities) {
      throw new Error('You must provide the entities option');
    }

    return {
      module: RoleModule,
      imports: createRoleImports({ entities }),
      providers: createRoleProviders({ entities, overrides: options }),
      exports: createRoleExports(),
      controllers: createRoleControllers(options),
    };
  }
}
