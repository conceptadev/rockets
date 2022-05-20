import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@concepta/nestjs-core';
import {
  AuthenticationModule,
  IssueTokenService,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import { FederatedModule } from '@concepta/nestjs-federated';
import {
  AUTH_GITHUB_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_GITHUB_MODULE_OPTIONS_TOKEN,
  AUTH_GITHUB_MODULE_SETTINGS_TOKEN,
} from './auth-github.constants';
import { authGithubDefaultConfig } from './config/auth-github-default.config';
import { AuthGithubOptionsInterface } from './interfaces/auth-github-options.interface';
import { AuthGithubStrategy } from './auth-github.strategy';
import { AuthGithubController } from './auth-github.controller';

/**
 * Auth GitHub module
 */
@Module({
  providers: [AuthGithubStrategy],
  controllers: [AuthGithubController],
})
export class AuthGithubModule extends createConfigurableDynamicRootModule<
  AuthGithubModule,
  AuthGithubOptionsInterface
>(AUTH_GITHUB_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(authGithubDefaultConfig),
    AuthenticationModule.deferred({
      timeoutMessage:
        'AuthGithubModule requires AuthenticationModule to be registered in your application.',
    }),
    FederatedModule.deferred({
      timeoutMessage:
        'AuthGithubModule requires FederatedModule to be registered in your application.',
    }),
  ],
  providers: [
    {
      provide: AUTH_GITHUB_MODULE_SETTINGS_TOKEN,
      inject: [AUTH_GITHUB_MODULE_OPTIONS_TOKEN, authGithubDefaultConfig.KEY],
      useFactory: async (
        options: AuthGithubOptionsInterface,
        defaultSettings: ConfigType<typeof authGithubDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: AUTH_GITHUB_ISSUE_TOKEN_SERVICE_TOKEN,
      inject: [AUTH_GITHUB_MODULE_OPTIONS_TOKEN, IssueTokenService],
      useFactory: async (
        options: AuthGithubOptionsInterface,
        defaultService: IssueTokenServiceInterface,
      ) => options.issueTokenService ?? defaultService,
    },
  ],
  exports: [AUTH_GITHUB_ISSUE_TOKEN_SERVICE_TOKEN],
}) {
  static register(options: AuthGithubOptionsInterface = {}) {
    const module = AuthGithubModule.forRoot(AuthGithubModule, options);

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthGithubOptionsInterface> &
      ModuleOptionsControllerInterface,
  ) {
    const module = AuthGithubModule.forRootAsync(AuthGithubModule, options);

    negotiateController(module, options);

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthGithubModule, AuthGithubOptionsInterface>(
      AuthGithubModule,
      options,
    );
  }
}
