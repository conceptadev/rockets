import { DynamicModule, Module } from '@nestjs/common';

import {
  FileAsyncOptions,
  FileModuleClass,
  FileOptions,
} from './file.module-definition';

@Module({})
export class FileModule extends FileModuleClass {
  static register(options: FileOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: FileAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: FileOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: FileAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
