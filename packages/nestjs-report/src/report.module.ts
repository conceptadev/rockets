import { DynamicModule, Module } from '@nestjs/common';

import {
  ReportAsyncOptions,
  ReportModuleClass,
  ReportOptions,
} from './report.module-definition';

@Module({})
export class ReportModule extends ReportModuleClass {
  static register(options: ReportOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: ReportAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: ReportOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: ReportAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
