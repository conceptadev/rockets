import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-core';
import {
  AuthenticationModule,
  VerifyTokenService,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import {
  AUTH_JWT_MODULE_OPTIONS_TOKEN,
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
} from './auth-jwt.constants';
import { authJwtDefaultConfig } from './config/auth-jwt-default.config';

import { AuthJwtOptionsInterface } from './interfaces/auth-jwt-options.interface';
import { AuthJwtStrategy } from './auth-jwt.strategy';

/**
 * Auth local module
 */
@Module({
  providers: [AuthJwtStrategy, VerifyTokenService],
  exports: [AuthJwtStrategy],
})
export class AuthJwtModule extends createConfigurableDynamicRootModule<
  AuthJwtModule,
  AuthJwtOptionsInterface
>(AUTH_JWT_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(authJwtDefaultConfig),
    AuthenticationModule.deferred({
      timeoutMessage:
        'AuthJwtModule requires AuthenticationModule to be registered in your application.',
    }),
  ],
  providers: [
    {
      provide: AUTH_JWT_MODULE_SETTINGS_TOKEN,
      inject: [AUTH_JWT_MODULE_OPTIONS_TOKEN, authJwtDefaultConfig.KEY],
      useFactory: async (
        options: AuthJwtOptionsInterface,
        defaultSettings: ConfigType<typeof authJwtDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
      inject: [AUTH_JWT_MODULE_OPTIONS_TOKEN, VerifyTokenService],
      useFactory: async (
        options: AuthJwtOptionsInterface,
        defaultService: VerifyTokenServiceInterface,
      ) => options.verifyTokenService ?? defaultService,
    },
    {
      provide: AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
      inject: [AUTH_JWT_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: AuthJwtOptionsInterface) =>
        options?.userLookupService,
    },
  ],
  exports: [
    AUTH_JWT_MODULE_SETTINGS_TOKEN,
    AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
    AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  ],
}) {
  static register(options: AuthJwtOptionsInterface) {
    return AuthJwtModule.forRoot(AuthJwtModule, options);
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthJwtOptionsInterface> = {},
  ) {
    return AuthJwtModule.forRootAsync(AuthJwtModule, options);
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthJwtModule, AuthJwtOptionsInterface>(
      AuthJwtModule,
      options,
    );
  }
}
