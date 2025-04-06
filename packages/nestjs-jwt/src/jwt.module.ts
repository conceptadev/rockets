import { DynamicModule, Module } from '@nestjs/common';

import {
  JwtModuleClass,
  JwtOptions,
  JwtAsyncOptions,
} from './jwt.module-definition';

@Module({})
export class JwtModule extends JwtModuleClass {
  static register(options: JwtOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: JwtAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: JwtOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: JwtAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
