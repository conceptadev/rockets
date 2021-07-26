import { Module, DynamicModule, Global } from '@nestjs/common';
import { ACCESS_CONTROL_OPTIONS_KEY } from './constants';
import { AccessControlModuleOptions } from './interfaces/access-control-module-options.interface';

@Global()
@Module({})
export class AccessControlModule {
  /**
   * Register a pre-defined roles
   * @param {RolesBuilder} accessControl  A list containing the access grant
   * @param {ACOptions} options  A configurable options
   * definitions. See the structure of this object in the examples.
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
