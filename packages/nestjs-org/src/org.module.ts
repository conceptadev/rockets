import { DynamicModule, Module } from '@nestjs/common';

import {
  OrgAsyncOptions,
  OrgModuleClass,
  OrgOptions,
} from './org.module-definition';

/**
 * Org Module
 */
@Module({})
export class OrgModule extends OrgModuleClass {
  static register(options: OrgOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: OrgAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: OrgOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: OrgAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
