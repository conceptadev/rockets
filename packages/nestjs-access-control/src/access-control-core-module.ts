import { DynamicModule, Module } from '@nestjs/common';
import { ACCESS_CONTROL_OPTIONS_KEY } from './constants';
import { AccessControlAsyncOptions } from './interfaces/access-control-async-options';
import { AccessControlOptions } from '.';

@Module({})
export class AccessControlCoreModule {
  static forRoot(options: AccessControlOptions): DynamicModule {
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

  static forRootAsync(options: AccessControlAsyncOptions): DynamicModule {
    return {
      module: AccessControlCoreModule,
      imports: options.imports,
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
