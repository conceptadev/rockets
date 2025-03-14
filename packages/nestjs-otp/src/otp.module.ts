import { DynamicModule, Module } from '@nestjs/common';

import {
  OtpAsyncOptions,
  OtpModuleClass,
  OtpOptions,
  createOtpExports,
  createOtpImports,
  createOtpProviders,
} from './otp.module-definition';
import { OtpMissingEntitiesOptionsException } from './exceptions/otp-missing-entities-options.exception';

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

  static forFeature(options: OtpOptions): DynamicModule {
    const { entities } = options;

    if (!entities) {
      throw new OtpMissingEntitiesOptionsException();
    }

    return {
      module: OtpModule,
      imports: createOtpImports({ entities }),
      providers: createOtpProviders({ entities, overrides: options }),
      exports: createOtpExports(),
    };
  }
}
