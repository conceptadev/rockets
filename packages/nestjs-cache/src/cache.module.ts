import { DynamicModule, Module } from '@nestjs/common';

import {
  CacheAsyncOptions,
  CacheModuleClass,
  CacheOptions,
  createCacheExports,
  createCacheImports,
  createCacheProviders,
} from './cache.module-definition';
import LOCALES from './locales';
import { I18n } from '@concepta/i18n';
import { CacheMissingEntitiesOptionException } from './exceptions/cache-missing-entities-option.exception';

/**
 * Cache Module
 */
@Module({})
export class CacheModule extends CacheModuleClass {
  constructor() {
    super();
    I18n.addTranslations(LOCALES);
  }

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

  static forFeature(options: CacheOptions): DynamicModule {
    const { entities } = options;

    if (!entities) {
      throw new CacheMissingEntitiesOptionException();
    }

    return {
      module: CacheModule,
      imports: createCacheImports({ entities }),
      providers: createCacheProviders({ entities, overrides: options }),
      exports: createCacheExports(),
    };
  }
}
