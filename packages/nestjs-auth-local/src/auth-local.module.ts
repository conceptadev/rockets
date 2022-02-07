import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@rockts-org/nestjs-common';
import { UserModule, UserService } from '@rockts-org/nestjs-user';
import { PasswordModule } from '@rockts-org/nestjs-password';
import {
  AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
} from './auth-local.constants';
import { authLocalDefaultConfig } from './config/auth-local-default.config';

import { AuthLocalOptionsInterface } from './interfaces/auth-local-options.interface';
import { AuthLocalStrategy } from './auth-local.strategy';
import {
  AuthenticationModule,
  IssueTokenService,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { AuthLocalUserLookupServiceInterface } from './interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalUserLookupService } from './services/auth-local-user-lookup.service';
import { DefaultAuthLocalUserLookupService } from './services/default-auth-local-user-lookup.service';
import { AuthLocalController } from './auth-local.controller';

/**
 * Auth local module
 */
@Module({
  providers: [
    DefaultAuthLocalUserLookupService,
    AuthLocalStrategy,
    UserService,
  ],
  exports: [AuthLocalUserLookupService],
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
      provide: AuthLocalUserLookupService,
      inject: [
        AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
        DefaultAuthLocalUserLookupService,
      ],
      useFactory: async (
        options: AuthLocalOptionsInterface,
        defaultService: AuthLocalUserLookupServiceInterface,
      ) => options.userLookupService ?? defaultService,
    },
    {
      provide: AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
      inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN, IssueTokenService],
      useFactory: async (
        options: AuthLocalOptionsInterface,
        defaultService: IssueTokenServiceInterface,
      ) => options.issueTokenService ?? defaultService,
    },
  ],
  exports: [AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN],
}) {
  static register(options: AuthLocalOptionsInterface = {}) {
    const module = AuthLocalModule.forRoot(AuthLocalModule, options);

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthLocalOptionsInterface> &
      ModuleOptionsControllerInterface,
  ) {
    const module = AuthLocalModule.forRootAsync(AuthLocalModule, {
      useFactory: () => ({}),
      ...options,
    });

    negotiateController(module, options);

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthLocalModule, AuthLocalOptionsInterface>(
      AuthLocalModule,
      options,
    );
  }
}
