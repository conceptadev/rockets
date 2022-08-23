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

import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthRecoveryNotificationService } from './services/auth-recovery-notification.service';
import { AuthRecoveryController } from './auth-recovery.controller';

@Module({
  providers: [AuthRecoveryService, AuthRecoveryNotificationService],
  controllers: [AuthRecoveryController],
  exports: [AuthRecoveryService],
})
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
