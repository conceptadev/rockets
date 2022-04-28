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
  createCustomRepositoryProvider,
  createEntityRepositoryProvider,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { UserRepository } from './user.repository';
import { userDefaultConfig } from './config/user-default.config';
import { User } from './entities/user.entity';
import { UserOptionsInterface } from './interfaces/user-options.interface';
import { UserOrmOptionsInterface } from './interfaces/user-orm-options.interface';
import {
  USER_MODULE_OPTIONS_TOKEN,
  USER_MODULE_USER_ENTITY_REPO_TOKEN,
  USER_MODULE_USER_CUSTOM_REPO_TOKEN,
  USER_MODULE_SETTINGS_TOKEN,
} from './user.constants';
import { UserController } from './user.controller';
import { UserLookupService } from './services/user-lookup.service';
import { UserCrudService } from './services/user-crud.service';
import { UserLookupServiceInterface } from './interfaces/user-lookup-service.interface';
import { DefaultUserLookupService } from './services/default-user-lookup.service';
import { UserMutateService } from './services/user-mutate.service';
import { DefaultUserMutateService } from './services/default-user-mutate.service';

/**
 * User Module
 */
@Module({
  providers: [
    DefaultUserLookupService,
    DefaultUserMutateService,
    UserCrudService,
    PasswordStorageService,
  ],
  exports: [UserLookupService, UserMutateService, UserCrudService],
  controllers: [UserController],
})
export class UserModule extends createConfigurableDynamicRootModule<
  UserModule,
  UserOptionsInterface
>(USER_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(userDefaultConfig),
    CrudModule.deferred({
      timeoutMessage:
        'UserModule requires CrudModule to be registered in your application.',
    }),
  ],
  providers: [
    {
      provide: USER_MODULE_SETTINGS_TOKEN,
      inject: [USER_MODULE_OPTIONS_TOKEN, userDefaultConfig.KEY],
      useFactory: async (
        options: UserOptionsInterface,
        defaultSettings: ConfigType<typeof userDefaultConfig>,
      ) => options.settings ?? defaultSettings,
    },
    {
      provide: UserLookupService,
      inject: [USER_MODULE_OPTIONS_TOKEN, DefaultUserLookupService],
      useFactory: async (
        options: UserOptionsInterface,
        defaultService: UserLookupServiceInterface,
      ) => options.userLookupService ?? defaultService,
    },
    {
      provide: UserMutateService,
      inject: [USER_MODULE_OPTIONS_TOKEN, DefaultUserMutateService],
      useFactory: async (
        options: UserOptionsInterface,
        defaultService: DefaultUserMutateService,
      ) => options.userMutateService ?? defaultService,
    },
    createEntityRepositoryProvider(USER_MODULE_USER_ENTITY_REPO_TOKEN, 'user'),
    createCustomRepositoryProvider(
      USER_MODULE_USER_CUSTOM_REPO_TOKEN,
      'userRepository',
    ),
  ],
  exports: [
    USER_MODULE_USER_ENTITY_REPO_TOKEN,
    USER_MODULE_USER_CUSTOM_REPO_TOKEN,
  ],
}) {
  /**
   * Register the User module synchronously.
   *
   * @param options module options
   */
  static register(
    options: UserOptionsInterface &
      UserOrmOptionsInterface &
      ModuleOptionsControllerInterface = {},
  ) {
    this.configureOrm(options);

    const module = UserModule.forRoot(UserModule, options);

    negotiateController(module, options);

    return module;
  }

  /**
   * Register the User module asynchronously.
   *
   * @param options module options
   */
  static registerAsync(
    options: AsyncModuleConfig<UserOptionsInterface> &
      UserOrmOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    this.configureOrm(options);

    const module = UserModule.forRootAsync(UserModule, {
      useFactory: () => ({}),
      ...options,
    });

    negotiateController(module, options);

    return module;
  }

  /**
   * Expect another module to have registered the User module.
   *
   * @param options module defer options
   */
  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<UserModule, UserOptionsInterface>(UserModule, options);
  }

  /**
   * Statically configure the ORM options.
   *
   * @param options ORM options
   */
  private static configureOrm(options: UserOrmOptionsInterface) {
    TypeOrmExtModule.configure(options.orm, {
      entities: {
        user: { useClass: User },
      },
      repositories: {
        userRepository: { useClass: UserRepository },
      },
    });
  }
}
