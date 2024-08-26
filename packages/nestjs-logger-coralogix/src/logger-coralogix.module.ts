import { DynamicModule, Module } from '@nestjs/common';

import {
  CoralogixAsyncOptions,
  CoralogixModuleClass,
  CoralogixOptions,
} from './logger-coralogix.module-definition';

@Module({})
export class LoggerCoralogixModule extends CoralogixModuleClass {
  static register(options: CoralogixOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: CoralogixAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: CoralogixOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: CoralogixAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
