import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthAppleAsyncOptions,
  AuthAppleModuleClass,
  AuthAppleOptions,
} from './auth-apple.module-definition';

/**
 * Auth Apple module
 */
@Module({})
export class AuthAppleModule extends AuthAppleModuleClass {
  static register(options: AuthAppleOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthAppleAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthAppleOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthAppleAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
