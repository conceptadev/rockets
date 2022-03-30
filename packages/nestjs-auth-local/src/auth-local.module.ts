import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@concepta/nestjs-common';
import {
  AuthenticationModule,
  IssueTokenService,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import { PasswordModule } from '@concepta/nestjs-password';
import {
  AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN,
} from './auth-local.constants';
import { authLocalDefaultConfig } from './config/auth-local-default.config';
import { AuthLocalOptionsInterface } from './interfaces/auth-local-options.interface';
import { AuthLocalStrategy } from './auth-local.strategy';
import { AuthLocalController } from './auth-local.controller';

/**
 * Auth local module
 */
@Module({
  providers: [AuthLocalStrategy],
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
      provide: AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN,
      inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: AuthLocalOptionsInterface) =>
        options.userLookupService,
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
  static register(options: AuthLocalOptionsInterface) {
    const module = AuthLocalModule.forRoot(AuthLocalModule, options);

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthLocalOptionsInterface> &
      ModuleOptionsControllerInterface,
  ) {
    const module = AuthLocalModule.forRootAsync(AuthLocalModule, options);

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
