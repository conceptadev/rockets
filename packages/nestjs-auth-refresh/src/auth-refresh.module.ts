import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';

import {
  AUTH_REFRESH_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_REFRESH_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_REFRESH_VERIFY_TOKEN_SERVICE_TOKEN,
  REFRESH_TOKEN_MODULE_OPTIONS_TOKEN,
  REFRESH_TOKEN_MODULE_SETTINGS_TOKEN,
} from './auth-refresh.constants';
import { authRefreshDefaultConfig } from './config/auth-refresh-default.config';

import { AuthRefreshOptionsInterface } from './interfaces/auth-refresh-options.interface';

import {
  AuthenticationModule,
  IssueTokenService,
  IssueTokenServiceInterface,
  UserLookupService,
  VerifyTokenService,
  VerifyTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';

import { AuthRefreshController } from './auth-refresh.controller';
import { JwtModule } from '@rockts-org/nestjs-jwt';

import { AuthRefreshStrategy } from './auth-refresh.strategy';

/**
 * Auth local module
 */
@Module({
  providers: [UserLookupService, AuthRefreshStrategy],
  controllers: [AuthRefreshController],
})
export class AuthRefreshModule extends createConfigurableDynamicRootModule<
  AuthRefreshModule,
  AuthRefreshOptionsInterface
>(REFRESH_TOKEN_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(authRefreshDefaultConfig),
    AuthenticationModule.deferred({
      timeoutMessage:
        'AuthRefreshModule requires AuthenticationModule to be registered in your application.',
    }),
    JwtModule.deferred({
      timeoutMessage:
        'AuthRefreshModule requires JwtModule to be registered in your application.',
    }),
  ],
  providers: [
    {
      provide: REFRESH_TOKEN_MODULE_SETTINGS_TOKEN,
      inject: [
        REFRESH_TOKEN_MODULE_OPTIONS_TOKEN,
        authRefreshDefaultConfig.KEY,
      ],
      useFactory: async (
        options: AuthRefreshOptionsInterface,
        defaultSettings: ConfigType<typeof authRefreshDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: AUTH_REFRESH_VERIFY_TOKEN_SERVICE_TOKEN,
      inject: [REFRESH_TOKEN_MODULE_OPTIONS_TOKEN, VerifyTokenService],
      useFactory: async (
        options: AuthRefreshOptionsInterface,
        defaultService: VerifyTokenServiceInterface,
      ) => options.issueTokenService ?? defaultService,
    },
    {
      provide: AUTH_REFRESH_ISSUE_TOKEN_SERVICE_TOKEN,
      inject: [REFRESH_TOKEN_MODULE_OPTIONS_TOKEN, IssueTokenService],
      useFactory: async (
        options: AuthRefreshOptionsInterface,
        defaultService: IssueTokenServiceInterface,
      ) => options.issueTokenService ?? defaultService,
    },
    {
      provide: AUTH_REFRESH_USER_LOOKUP_SERVICE_TOKEN,
      inject: [REFRESH_TOKEN_MODULE_OPTIONS_TOKEN, UserLookupService],
      useFactory: async (
        options: AuthRefreshOptionsInterface,
        defaultService: UserLookupService,
      ) => options?.userLookupService ?? defaultService,
    },
  ],
  exports: [AUTH_REFRESH_ISSUE_TOKEN_SERVICE_TOKEN],
}) {
  static register(options: AuthRefreshOptionsInterface = {}) {
    const module = AuthRefreshModule.forRoot(AuthRefreshModule, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthRefreshOptionsInterface> = {},
  ) {
    const module = AuthRefreshModule.forRootAsync(AuthRefreshModule, {
      useFactory: () => ({}),
      ...options,
    });

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthRefreshModule, AuthRefreshOptionsInterface>(
      AuthRefreshModule,
      options,
    );
  }
}
