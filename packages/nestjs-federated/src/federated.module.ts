import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@concepta/nestjs-common';
import {
  createCustomRepositoryProvider,
  createEntityRepositoryProvider,
} from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';

import { federatedDefaultConfig } from './config/federated-default.config';
import {
  FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN,
  FEDERATED_MODULE_FEDERATED_ENTITY_REPO_TOKEN,
  FEDERATED_MODULE_OPTIONS_TOKEN,
  FEDERATED_MODULE_SETTINGS_TOKEN,
  FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from './federated.constants';
import { FederatedOptionsInterface } from './interfaces/federated-options.interface';
import { FederatedOAuthService } from './services/federated-oauth.service';
import { FederatedService } from './services/federated.service';

/**
 * Auth local module
 */
@Module({
  providers: [FederatedService, FederatedOAuthService],
  exports: [FederatedService, FederatedOAuthService],
  controllers: [],
})
export class FederatedModule extends createConfigurableDynamicRootModule<
  FederatedModule,
  FederatedOptionsInterface
>(FEDERATED_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(federatedDefaultConfig)],
  providers: [
    {
      provide: FEDERATED_MODULE_SETTINGS_TOKEN,
      inject: [FEDERATED_MODULE_OPTIONS_TOKEN, federatedDefaultConfig.KEY],
      useFactory: async (
        options: FederatedOptionsInterface,
        defaultSettings: ConfigType<typeof federatedDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN,
      inject: [FEDERATED_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: FederatedOptionsInterface) =>
        options.userLookupService,
    },
    {
      provide: FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN,
      inject: [FEDERATED_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: FederatedOptionsInterface) =>
        options.userMutateService,
    },
    createEntityRepositoryProvider(
      FEDERATED_MODULE_FEDERATED_ENTITY_REPO_TOKEN,
      'federated',
    ),
    createCustomRepositoryProvider(
      FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN,
      'federatedRepository',
    ),
  ],
  exports: [
    FEDERATED_MODULE_FEDERATED_ENTITY_REPO_TOKEN,
    FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN,
  ],
}) {
  static register(options: FederatedOptionsInterface = {}) {
    const module = FederatedModule.forRoot(FederatedModule, options);

    negotiateController(module, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<FederatedOptionsInterface> &
      ModuleOptionsControllerInterface,
  ) {
    const module = FederatedModule.forRootAsync(FederatedModule, {
      useFactory: () => ({}),
      ...options,
    });

    negotiateController(module, options);

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<FederatedModule, FederatedOptionsInterface>(
      FederatedModule,
      options,
    );
  }
}
