import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@rockts-org/nestjs-common';
import { IssueTokenService, JwtModule } from '@rockts-org/nestjs-jwt';
import { UserLookupService, UserModule } from '@rockts-org/nestjs-user';
import { PasswordModule } from '@rockts-org/nestjs-password';
import {
  AUTH_LOCAL_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
} from './auth-local.constants';
import { AuthLocalController } from './auth-local.controller';
import { authLocalDefaultConfig } from './config/auth-local-default.config';

import { AuthLocalOptionsInterface } from './interfaces/auth-local-options.interface';
import { LocalStrategy } from './local.strategy';

/**
 * Auth local module
 */
@Module({
  providers: [AuthLocalController, LocalStrategy],
  exports: [AuthLocalController],
  controllers: [AuthLocalController],
})
export class AuthLocalModule extends createConfigurableDynamicRootModule<
  AuthLocalModule,
  AuthLocalOptionsInterface
>(AUTH_LOCAL_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(authLocalDefaultConfig),
    JwtModule.register(),
    UserModule.register(),
    PasswordModule.register(),
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
      provide: AUTH_LOCAL_USER_LOOKUP_SERVICE_TOKEN,
      inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN, UserLookupService],
      useFactory: async (
        options: AuthLocalOptionsInterface,
        defaultService: UserLookupService,
      ) => options.userLookupService ?? defaultService,
    },
    {
      provide: AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
      inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN, IssueTokenService],
      useFactory: async (
        options: AuthLocalOptionsInterface,
        defaultService: IssueTokenService,
      ) => options.issueTokenService ?? defaultService,
    },
  ],
  exports: [
    AUTH_LOCAL_USER_LOOKUP_SERVICE_TOKEN,
    AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
  ],
}) {
  static register(options: AuthLocalOptionsInterface = {}) {
    return AuthLocalModule.forRoot(AuthLocalModule, options);
  }
  static registerAsync(options: AsyncModuleConfig<AuthLocalOptionsInterface>) {
    return AuthLocalModule.forRootAsync(AuthLocalModule, options);
  }
}
