import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';
import { JwtModule, JwtIssueService } from '@rockts-org/nestjs-jwt';
import { UserModule, UserService } from '@rockts-org/nestjs-user';
import { PasswordModule } from '@rockts-org/nestjs-password';
import {
  AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
} from './auth-local.constants';
import { AuthLocalController } from './auth-local.controller';
import { authLocalDefaultConfig } from './config/auth-local-default.config';

import { AuthLocalOptionsInterface } from './interfaces/auth-local-options.interface';
import { LocalStrategy } from './local.strategy';
import {
  AuthenticationModule,
  CredentialLookupInterface,
  IssueTokenServiceInterface,
  UserLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { UserLookupService } from './services/user-lookup.service';
import { DefaultUserLookupService } from './services/default-user-lookup.service';

/**
 * Auth local module
 */
@Module({
  providers: [
    DefaultUserLookupService,
    AuthLocalController,
    LocalStrategy,
    UserService,
  ],
  exports: [UserLookupService, AuthLocalController],
  controllers: [AuthLocalController],
})
export class AuthLocalModule extends createConfigurableDynamicRootModule<
  AuthLocalModule,
  AuthLocalOptionsInterface
>(AUTH_LOCAL_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(authLocalDefaultConfig),
    AuthenticationModule.deferred({
      timeoutMessage:
        'AuthLocalModule requires AuthenticationModule to be registered in your application.',
    }),
    JwtModule.deferred({
      timeoutMessage:
        'AuthLocalModule requires JwtModule to be registered in your application.',
    }),
    PasswordModule.deferred({
      timeoutMessage:
        'AuthLocalModule requires PasswordModule to be registered in your application.',
    }),
    UserModule.deferred({
      timeoutMessage:
        'AuthLocalModule requires UserModule to be registered in your application.',
    }),
  ],
  providers: [
    {
      provide: AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
      inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN, authLocalDefaultConfig.KEY],
      useFactory: async (
        options: AuthLocalOptionsInterface,
        defaultSettings: ConfigType<typeof authLocalDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: UserLookupService,
      inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN, DefaultUserLookupService],
      useFactory: async (
        options: AuthLocalOptionsInterface,
        defaultService: UserLookupServiceInterface<CredentialLookupInterface>,
      ) => options.userLookupService ?? defaultService,
    },
    {
      provide: AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
      inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN, JwtIssueService],
      useFactory: async (
        options: AuthLocalOptionsInterface,
        defaultService: IssueTokenServiceInterface,
      ) => options.issueTokenService ?? defaultService,
    },
  ],
  exports: [AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN],
}) {
  static register(options: AuthLocalOptionsInterface = {}) {
    return AuthLocalModule.forRoot(AuthLocalModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<AuthLocalOptionsInterface>) {
    return AuthLocalModule.forRootAsync(AuthLocalModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthLocalModule, AuthLocalOptionsInterface>(
      AuthLocalModule,
      options,
    );
  }
}
