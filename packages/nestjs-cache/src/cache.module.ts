import { DynamicModule, Module } from '@nestjs/common';

import {
  CacheAsyncOptions,
  CacheModuleClass,
  CacheOptions,
} from './cache.module-definition';

/**
 * Cache Module
 */
@Module({})
export class CacheModule extends CacheModuleClass {
  static register(options: CacheOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: CacheAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: CacheOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: CacheAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
