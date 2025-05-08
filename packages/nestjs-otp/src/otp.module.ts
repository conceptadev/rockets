import { DynamicModule, Module } from '@nestjs/common';

import {
  OtpAsyncOptions,
  OtpModuleClass,
  OtpOptions,
} from './otp.module-definition';

/**
 * Otp Module
 */
@Module({})
export class OtpModule extends OtpModuleClass {
  static register(options: OtpOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: OtpAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: OtpOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: OtpAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
