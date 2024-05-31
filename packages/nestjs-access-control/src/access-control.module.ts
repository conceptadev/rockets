import { DynamicModule, Module } from '@nestjs/common';
import {
  AccessControlAsyncOptions,
  AccessControlModuleClass,
  AccessControlOptions,
  createAccessControlExports,
  createAccessControlImports,
  createAccessControlProviders,
} from './access-control.module-definition';

/**
 * Module responsible for managing access control and permissions.
 * This module integrates access control functionality into a NestJS application.
 */
@Module({})
export class AccessControlModule extends AccessControlModuleClass {
  /**
   * Registers the AccessControlModule with synchronous options.
   * @param options The synchronous options for configuring access control.
   * @returns A dynamically generated module.
   */
  static register(options: AccessControlOptions): DynamicModule {
    return super.register(options);
  }

  /**
   * Registers the AccessControlModule with additional custom options.
   * This method allows for more flexible configuration of the access control module.
   * @param options The custom options for configuring access control.
   * @returns A dynamically generated module with custom configurations.
   */
  static registerCustom(options: AccessControlOptions): DynamicModule {
    const customOptions = { ...options, customFeatureEnabled: true };
    return {
      module: AccessControlModule,
      imports: createAccessControlImports(customOptions),
      providers: createAccessControlProviders({ overrides: customOptions }),
      exports: createAccessControlExports(),
    };
  }
  /**
   * Registers the AccessControlModule with asynchronous options.
   * This method allows for asynchronous configuration of the access control module,
   * enabling the use of dynamic data sources or configurations that are not available at startup.
   * @param options The asynchronous options for configuring access control.
   * @returns A dynamically generated module with asynchronous configurations.
   */
  static registerAsync(options: AccessControlAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  /**
   * Registers the AccessControlModule for the root application with synchronous options and marks it as global.
   * This method allows the AccessControlModule to be available globally throughout the application.
   * @param options The synchronous options for configuring access control.
   * @returns A dynamically generated module with global scope.
   */
  static forRoot(options: AccessControlOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }
  /**
   * Registers the AccessControlModule for the root application with asynchronous options and marks it as global.
   * This method allows the AccessControlModule to be available globally throughout the application with configurations that can be resolved asynchronously.
   * @param options The asynchronous options for configuring access control.
   * @returns A dynamically generated module with global scope and asynchronous configurations.
   */

  static forRootAsync(options: AccessControlAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
  /**
   * Registers the AccessControlModule for specific features with custom options.
   * This method allows for configuring access control with specific options tailored to particular features of the application.
   * @param options The custom options for configuring access control for specific features.
   * @returns A dynamically generated module with configurations specific to the features.
   */

  static forFeature(options: AccessControlOptions): DynamicModule {
    return {
      module: AccessControlModule,
      imports: createAccessControlImports(options),
      providers: createAccessControlProviders({ overrides: options }),
      exports: createAccessControlExports(),
    };
  }
}
