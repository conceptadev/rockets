import { Module, DynamicModule, Global } from '@nestjs/common';
import { ACCESS_CONTROL_OPTIONS_KEY } from './constants';
import { AccessControlModuleOptions } from './interfaces/access-control-module-options.interface';

@Global()
@Module({})
export class AccessControlModule {
  /**
   * Register a pre-defined roles
   *
   * @param {AccessControlModuleOptions} options  A configurable options definitions. See the structure of this object in the examples.
   * @returns {DynamicModule} The dynamic module.
   */
  public static register(options: AccessControlModuleOptions): DynamicModule {
    return {
      module: AccessControlModule,
      providers: [
        options.service,
        {
          provide: ACCESS_CONTROL_OPTIONS_KEY,
          useValue: options,
        },
      ],
      exports: [
        options.service,
        {
          provide: ACCESS_CONTROL_OPTIONS_KEY,
          useValue: options,
        },
      ],
    };
  }
}
