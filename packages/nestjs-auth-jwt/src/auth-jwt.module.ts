import { DynamicModule, Module } from '@nestjs/common';
import { VerifyTokenService } from '@concepta/nestjs-authentication';

import {
  AuthJwtAsyncOptions,
  AuthJwtModuleClass,
  AuthJwtOptions,
  createAuthJwtExports,
  createAuthJwtImports,
  createAuthJwtProviders,
} from './auth-jwt.module-definition';

import { AuthJwtStrategy } from './auth-jwt.strategy';

/**
 * Auth local module
 */
@Module({
  providers: [AuthJwtStrategy, VerifyTokenService],
  exports: [AuthJwtStrategy],
})
export class AuthJwtModule extends AuthJwtModuleClass {
  static register(options: AuthJwtOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthJwtAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthJwtOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthJwtAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: AuthJwtOptions): DynamicModule {
    return {
      module: AuthJwtModule,
      imports: createAuthJwtImports(),
      providers: createAuthJwtProviders({ overrides: options }),
      exports: createAuthJwtExports(),
    };
  }
}
