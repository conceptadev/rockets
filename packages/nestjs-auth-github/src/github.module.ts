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
import { FederatedModule } from '@concepta/nestjs-federated';
import {
  GITHUB_ISSUE_TOKEN_SERVICE_TOKEN,
  GITHUB_MODULE_OPTIONS_TOKEN,
  GITHUB_MODULE_SETTINGS_TOKEN,
  GITHUB_MODULE_USER_LOOKUP_SERVICE_TOKEN,
} from './github.constants';
import { githubDefaultConfig } from './config/github-default.config';
import { GithubOptionsInterface } from './interfaces/github-options.interface';
import { GithubStrategy } from './github.strategy';
import { GithubController } from './github.controller';

/**
 * Auth local module
 */
/**
 * Auth local module
 */
@Module({
  providers: [GithubStrategy],
  controllers: [GithubController],
})
export class GithubModule extends createConfigurableDynamicRootModule<
  GithubModule,
  GithubOptionsInterface
>(GITHUB_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(githubDefaultConfig),
    AuthenticationModule.deferred({
      timeoutMessage:
        'GithubModule requires AuthenticationModule to be registered in your application.',
    }),
    FederatedModule.deferred({
      timeoutMessage:
        'GithubModule requires FederatedModule to be registered in your application.',
    }),
  ],
  providers: [
    {
      provide: GITHUB_MODULE_SETTINGS_TOKEN,
      inject: [GITHUB_MODULE_OPTIONS_TOKEN, githubDefaultConfig.KEY],
      useFactory: async (
        options: GithubOptionsInterface,
        defaultSettings: ConfigType<typeof githubDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: GITHUB_MODULE_USER_LOOKUP_SERVICE_TOKEN,
      inject: [GITHUB_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: GithubOptionsInterface) =>
        options.userLookupService,
    },
    {
      provide: GITHUB_ISSUE_TOKEN_SERVICE_TOKEN,
      inject: [GITHUB_MODULE_OPTIONS_TOKEN, IssueTokenService],
      useFactory: async (
        options: GithubOptionsInterface,
        defaultService: IssueTokenServiceInterface,
      ) => options.issueTokenService ?? defaultService,
    },
  ],
  exports: [GITHUB_ISSUE_TOKEN_SERVICE_TOKEN],
}) {
  static register(options: GithubOptionsInterface) {
    const module = GithubModule.forRoot(GithubModule, options);

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<GithubOptionsInterface> &
      ModuleOptionsControllerInterface,
  ) {
    const module = GithubModule.forRootAsync(GithubModule, options);

    negotiateController(module, options);

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<GithubModule, GithubOptionsInterface>(
      GithubModule,
      options,
    );
  }
}
