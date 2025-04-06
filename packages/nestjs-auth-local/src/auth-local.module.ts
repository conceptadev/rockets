import { DynamicModule, Module } from '@nestjs/common';
import {
  AuthLocalAsyncOptions,
  AuthLocalModuleClass,
  AuthLocalOptions,
} from './auth-local.module-definition';

/**
 * Auth local module
 */
@Module({})
export class AuthLocalModule extends AuthLocalModuleClass {
  static register(options: AuthLocalOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthLocalAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthLocalOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthLocalAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
