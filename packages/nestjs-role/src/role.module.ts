import { DynamicModule, Module } from '@nestjs/common';

import {
  RoleAsyncOptions,
  RoleModuleClass,
  RoleOptions,
} from './role.module-definition';

/**
 * Role Module
 */
@Module({})
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
}
