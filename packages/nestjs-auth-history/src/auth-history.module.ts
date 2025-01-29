import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthHistoryAsyncOptions,
  AuthHistoryModuleClass,
  AuthHistoryOptions,
} from './auth-history.module-definition';

/**
 * AuthHistory Module
 */
@Module({})
export class AuthHistoryModule extends AuthHistoryModuleClass {
  static register(options: AuthHistoryOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthHistoryAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthHistoryOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthHistoryAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
