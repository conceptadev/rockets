import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthJwtAsyncOptions,
  AuthJwtModuleClass,
  AuthJwtOptions,
  createAuthJwtExports,
  createAuthJwtImports,
  createAuthJwtProviders,
} from './auth-jwt.module-definition';

/**
 * Module responsible for JWT-based authentication.
 * This module offers methods to register and configure JWT authentication synchronously and asynchronously.
 */
@Module({})
export class AuthJwtModule extends AuthJwtModuleClass {
  /**
   * Registers the AuthJwtModule with synchronous options.
   * This method configures JWT authentication using the provided options.
   * @param options The synchronous options for configuring JWT authentication.
   * @returns A dynamically generated module.
   */
  static register(options: AuthJwtOptions): DynamicModule {
    return super.register(options);
  }

  /**
   * Registers the AuthJwtModule with asynchronous options.
   * This method configures JWT authentication using the provided asynchronous options.
   * It allows for dependency injection and dynamic configuration, which is useful when options are not available at startup.
   * @param options The asynchronous options for configuring JWT authentication.
   * @returns A dynamically generated module.
   */
  static registerAsync(options: AuthJwtAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  /**
   * Registers the AuthJwtModule globally with synchronous options.
   * This method configures JWT authentication as a global module, which will be available throughout the application.
   * @param options The synchronous options for configuring JWT authentication globally.
   * @returns A dynamically generated module with the configured global options.
   */
  static forRoot(options: AuthJwtOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  /**
   * Registers the AuthJwtModule globally with asynchronous options.
   * This method configures JWT authentication as a global module asynchronously, which will be available throughout the application.
   * It allows for dependency injection and dynamic configuration, which is useful when options are not available at startup.
   * @param options The asynchronous options for configuring JWT authentication globally.
   * @returns A dynamically generated module with the configured global options.
   */
  static forRootAsync(options: AuthJwtAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  /**
   * Registers the AuthJwtModule for specific features with custom options.
   * This method allows for configuring JWT authentication with specific options tailored to particular features of the application.
   * @param options The custom options for configuring JWT authentication for specific features.
   * @returns A dynamically generated module with configurations specific to the features.
   */
  static forFeature(options: AuthJwtOptions): DynamicModule {
    return {
      module: AuthJwtModule,
      imports: createAuthJwtImports(),
      providers: createAuthJwtProviders({ overrides: options }),
      exports: createAuthJwtExports(),
    };
  }
}
