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
import { UserModule, UserService } from '@concepta/nestjs-user';
import {
  FEDERATED_MODULE_OPTIONS_TOKEN,
  FEDERATED_MODULE_SETTINGS_TOKEN,
} from './federated.constants';
import { federatedDefaultConfig } from './config/federated-default.config';

import { FederatedOptionsInterface } from './interfaces/federated-options.interface';

import {
  AuthenticationModule,
} from '@concepta/nestjs-authentication';
import { FederatedUserLookupServiceInterface } from './interfaces/federated-user-lookup-service.interface';
import { FederatedUserLookupService } from './services/federated-user-lookup.service';
import { DefaultFederatedUserLookupService } from './services/default-federated-user-lookup.service';

import { FederatedUserCreateServiceInterface } from './interfaces/federated-user-create-service.interface';
import { FederatedUserCreateService } from './services/federated-user-create.service';
import { DefaultFederatedUserCreateService } from './services/default-federated-user-create.service';
import { FederatedService } from './services/federated.service';
import { JwtModule } from '@concepta/nestjs-jwt';
import { CrudModule } from '@concepta/nestjs-crud';
import { createCustomRepositoryProvider, createEntityRepositoryProvider } from '@concepta/nestjs-typeorm-ext';
import {
  FEDERATED_MODULE_FEDERATED_ENTITY_REPO_TOKEN,
  FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN
} from './federated.constants'
import { PasswordModule } from '@concepta/nestjs-password';
/**
 * Auth local module
 */
@Module({
  providers: [
    DefaultFederatedUserLookupService,
    DefaultFederatedUserCreateService,
    FederatedUserLookupService,
    FederatedUserCreateService,
    FederatedService,
  ],
  exports: [
    FederatedService
  ],
  controllers: [],
})
export class FederatedModule extends createConfigurableDynamicRootModule<
  FederatedModule,
  FederatedOptionsInterface
>(FEDERATED_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(federatedDefaultConfig),
    UserModule.deferred({
      timeoutMessage:
        'FederatedModule requires UserModule to be registered in your application.',
    }),
  ],
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
      provide: FederatedUserLookupService,
      inject: [
        FEDERATED_MODULE_OPTIONS_TOKEN,
        DefaultFederatedUserLookupService,
      ],
      useFactory: async (
        options: FederatedOptionsInterface,
        defaultService: FederatedUserLookupServiceInterface,
      ) => options.userLookupService ?? defaultService,
    },
    {
      provide: FederatedUserCreateService,
      inject: [
        FEDERATED_MODULE_OPTIONS_TOKEN,
        DefaultFederatedUserCreateService],
      useFactory: async (
        options: FederatedOptionsInterface,
        defaultService: FederatedUserCreateServiceInterface,
      ) => options.userCreateService ?? defaultService,
    },
    createEntityRepositoryProvider(FEDERATED_MODULE_FEDERATED_ENTITY_REPO_TOKEN, 'federated'),
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
