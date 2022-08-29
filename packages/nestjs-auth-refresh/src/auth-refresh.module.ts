import { DynamicModule, Module } from '@nestjs/common';
import {
  IssueTokenService,
  VerifyTokenService,
} from '@concepta/nestjs-authentication';

import {
  AuthRefreshAsyncOptions,
  AuthRefreshModuleClass,
  AuthRefreshOptions,
  createAuthRefreshControllers,
  createAuthRefreshExports,
  createAuthRefreshImports,
  createAuthRefreshProviders,
} from './auth-refresh.module-definition';

import { AuthRefreshStrategy } from './auth-refresh.strategy';
import { AuthRefreshController } from './auth-refresh.controller';

/**
 * Auth Refresh module
 */
@Module({
  providers: [AuthRefreshStrategy, VerifyTokenService, IssueTokenService],
  controllers: [AuthRefreshController],
  exports: [AuthRefreshStrategy],
})
export class AuthRefreshModule extends AuthRefreshModuleClass {
  static register(options: AuthRefreshOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthRefreshAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthRefreshOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthRefreshAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: AuthRefreshOptions): DynamicModule {
    return {
      module: AuthRefreshModule,
      imports: createAuthRefreshImports(),
      providers: createAuthRefreshProviders({ overrides: options }),
      controllers: createAuthRefreshControllers(options),
      exports: createAuthRefreshExports(),
    };
  }
}
