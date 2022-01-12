import { Module, DynamicModule, Global } from '@nestjs/common';
import { AccessControlCoreModule } from './access-control-core-module';
import { ACCESS_CONTROL_OPTIONS_KEY } from './constants';
import { AccessControlDefaultService } from './access-control-default.service';
import { AccessControlAsyncOptions } from './interfaces/access-control-async-options';
import { AccessControlModuleOptions } from './interfaces/access-control-module-options.interface';
import { defaultAccessControl } from './config/access-control.config';

@Global()
@Module({
  imports: [AccessControlCoreModule.forRoot(defaultAccessControl)],
  providers: [AccessControlDefaultService],
  exports: [AccessControlDefaultService],
})
export class AccessControlModule {
  /**
   * Register a pre-defined roles
   *
   * @param {AccessControlModuleOptions} options  A configurable options definitions. See the structure of this object in the examples.
   * @returns {DynamicModule} The dynamic module.
   */

  // (register) - Deprecated option
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

  public static forRoot(options: AccessControlModuleOptions): DynamicModule {
    return {
      module: AccessControlModule,
      imports: [AccessControlCoreModule.forRoot(options)],
      providers: [AccessControlDefaultService],
      exports: [AccessControlDefaultService],
    };
  }

  public static forRootAsync(
    options: AccessControlAsyncOptions,
  ): DynamicModule {
    return {
      module: AccessControlModule,
      imports: [AccessControlCoreModule.forRootAsync(options)],
      providers: [AccessControlDefaultService],
      exports: [AccessControlDefaultService],
    };
  }
}
