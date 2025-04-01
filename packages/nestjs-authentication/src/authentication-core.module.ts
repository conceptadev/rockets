import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthenticationAsyncOptions,
  AuthenticationCoreModuleClass,
  AuthenticationOptions,
  createAuthenticationImports,
  createAuthenticationProviders,
  createAuthenticationExports,
} from './authentication-core.module-definition';

/**
 * Authentication module
 */
@Module({})
export class AuthenticationCoreModule extends AuthenticationCoreModuleClass {
  static register(options: AuthenticationOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthenticationAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthenticationOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthenticationAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: AuthenticationOptions): DynamicModule {
    return {
      module: AuthenticationCoreModule,
      imports: createAuthenticationImports(),
      providers: createAuthenticationProviders({ overrides: options }),
      exports: createAuthenticationExports(),
    };
  }
}
