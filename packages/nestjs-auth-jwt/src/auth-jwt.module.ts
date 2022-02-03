import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';

import {
  AUTH_JWT_MODULE_OPTIONS_TOKEN,
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
} from './auth-jwt.constants';
import { authJwtDefaultConfig } from './config/auth-jwt-default.config';

import { AuthJwtOptionsInterface } from './interfaces/auth-jwt-options.interface';
import { AuthJwtStrategy } from './auth-jwt.strategy';
import {
  AuthenticationModule,
  UserLookupService,
  VerifyTokenService,
} from '@rockts-org/nestjs-authentication';
import { VerifyTokenServiceInterface } from '@rockts-org/nestjs-authentication/src/interfaces/verify-token-service.interface';

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
      ) => options.issueTokenService ?? defaultService,
    },
    {
      provide: AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
      inject: [AUTH_JWT_MODULE_OPTIONS_TOKEN, UserLookupService],
      useFactory: async (
        options: AuthJwtOptionsInterface,
        defaultService: UserLookupService,
      ) => options?.userLookupService ?? defaultService,
    },
  ],
  exports: [
    AUTH_JWT_MODULE_SETTINGS_TOKEN,
    AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
    AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  ],
}) {
  static register(options: AuthJwtOptionsInterface = {}) {
    const module = AuthJwtModule.forRoot(AuthJwtModule, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthJwtOptionsInterface> = {},
  ) {
    const module = AuthJwtModule.forRootAsync(AuthJwtModule, {
      useFactory: () => ({}),
      ...options,
    });

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthJwtModule, AuthJwtOptionsInterface>(
      AuthJwtModule,
      options,
    );
  }
}
