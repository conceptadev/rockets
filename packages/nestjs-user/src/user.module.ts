import { DynamicModule, Module } from '@nestjs/common';

import {
  UserAsyncOptions,
  UserModuleClass,
  UserOptions,
} from './user.module-definition';

/**
 * User Module
 */
@Module({})
export class UserModule extends UserModuleClass {
  static register(options: UserOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: UserAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: UserOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: UserAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
