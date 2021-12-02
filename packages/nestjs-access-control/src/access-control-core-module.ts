import { DynamicModule, Module } from '@nestjs/common';
import { AccessControlModuleOptions } from './interfaces/access-control-module-options.interface';
import { ACCESS_CONTROL_OPTIONS_KEY } from './constants';

@Module({})
export class AccessControlCoreModule {
  static forRoot(options: AccessControlModuleOptions): DynamicModule {
    return {
      module: AccessControlCoreModule,
      providers: [
        options.service,
        {
          provide: ACCESS_CONTROL_OPTIONS_KEY,
          useValue: options,
        },
      ],
      exports: [ACCESS_CONTROL_OPTIONS_KEY],
    };
  }

  static forRootAsync(options: AccessControlModuleOptions): DynamicModule {
    return {
      module: AccessControlCoreModule,
      providers: [
        options.service,
        {
          provide: ACCESS_CONTROL_OPTIONS_KEY,
          useExisting: options.service,
        },
      ],
      exports: [ACCESS_CONTROL_OPTIONS_KEY],
    };
  }
}
