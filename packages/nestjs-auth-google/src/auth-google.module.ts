import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthGoogleAsyncOptions,
  AuthGoogleModuleClass,
  AuthGoogleOptions,
} from './auth-google.module-definition';

/**
 * Auth Google module
 */
@Module({})
export class AuthGoogleModule extends AuthGoogleModuleClass {
  static register(options: AuthGoogleOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthGoogleAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthGoogleOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthGoogleAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
