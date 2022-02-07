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
import {
  createCustomRepositoryProvider,
  createEntityRepositoryProvider,
  TypeOrmExtModule,
} from '@rockts-org/nestjs-typeorm-ext';
import { UserRepository } from './user.repository';
import { userDefaultConfig } from './config/user-default.config';
import { User } from './entities/user.entity';
import { UserOptionsInterface } from './interfaces/user-options.interface';
import { UserOrmOptionsInterface } from './interfaces/user-orm-options.interface';
import { UserService } from './services/user.service';
import {
  USER_MODULE_OPTIONS_TOKEN,
  USER_MODULE_USER_ENTITY_REPO_TOKEN,
  USER_MODULE_USER_CUSTOM_REPO_TOKEN,
  USER_MODULE_SETTINGS_TOKEN,
} from './user.constants';
import { UserController } from './user.controller';
import { UserServiceInterface } from './interfaces/user-service.interface';
import { DefaultUserService } from './services/default-user.service';
import { UserCrudService } from './services/user-crud.service';
import { CrudModule } from '@rockts-org/nestjs-crud';

@Module({
  providers: [DefaultUserService, UserCrudService],
  exports: [UserService, UserCrudService],
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
      provide: UserService,
      inject: [USER_MODULE_OPTIONS_TOKEN, DefaultUserService],
      useFactory: async (
        options: UserOptionsInterface,
        defaultService: UserServiceInterface,
      ) => options.userService ?? defaultService,
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

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<UserModule, UserOptionsInterface>(UserModule, options);
  }

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
