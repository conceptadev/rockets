import { DynamicModule, Module } from '@nestjs/common';
import { AccessControlModuleOptions } from './interfaces/access-control-module-options.interface';
import { ACCESS_CONTROL_OPTIONS_KEY } from './constants';
import { AccessControlAsyncModuleOptions } from './interfaces/access-control-async-module-options';

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

  static forRootAsync(options: AccessControlAsyncModuleOptions): DynamicModule {
    return {
      module: AccessControlCoreModule,
      providers: [
        {
          provide: ACCESS_CONTROL_OPTIONS_KEY,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [ACCESS_CONTROL_OPTIONS_KEY],
    };
  }
}
