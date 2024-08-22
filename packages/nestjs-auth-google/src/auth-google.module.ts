import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthGoogleAsyncOptions,
  AuthGoogleModuleClass,
  AuthGoogleOptions,
  createAuthGoogleControllers,
  createAuthGoogleExports,
  createAuthGoogleImports,
  createAuthGoogleProviders,
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

  static forFeature(options: AuthGoogleOptions): DynamicModule {
    return {
      module: AuthGoogleModule,
      imports: createAuthGoogleImports(),
      providers: createAuthGoogleProviders({ overrides: options }),
      controllers: createAuthGoogleControllers(options),
      exports: createAuthGoogleExports(),
    };
  }
}
