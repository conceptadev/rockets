import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthVerifyAsyncOptions,
  AuthVerifyModuleClass,
  AuthVerifyOptions,
  createAuthVerifyControllers,
  createAuthVerifyExports,
  createAuthVerifyImports,
  createAuthVerifyProviders,
} from './auth-verify.module-definition';

@Module({})
export class AuthVerifyModule extends AuthVerifyModuleClass {
  static register(options: AuthVerifyOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthVerifyAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthVerifyOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthVerifyAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: AuthVerifyOptions): DynamicModule {
    return {
      module: AuthVerifyModule,
      imports: createAuthVerifyImports(),
      providers: createAuthVerifyProviders({ overrides: options }),
      controllers: createAuthVerifyControllers(options),
      exports: createAuthVerifyExports(),
    };
  }
}
