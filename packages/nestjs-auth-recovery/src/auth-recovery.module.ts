import { DynamicModule, Module } from '@nestjs/common';

import {
  AuthRecoveryAsyncOptions,
  AuthRecoveryModuleClass,
  AuthRecoveryOptions,
  createAuthRecoveryControllers,
  createAuthRecoveryExports,
  createAuthRecoveryImports,
  createAuthRecoveryProviders,
} from './auth-recovery.module-definition';

@Module({})
export class AuthRecoveryModule extends AuthRecoveryModuleClass {
  static register(options: AuthRecoveryOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthRecoveryAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthRecoveryOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthRecoveryAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: AuthRecoveryOptions): DynamicModule {
    return {
      module: AuthRecoveryModule,
      imports: createAuthRecoveryImports(),
      providers: createAuthRecoveryProviders({ overrides: options }),
      controllers: createAuthRecoveryControllers(options),
      exports: createAuthRecoveryExports(),
    };
  }
}
