import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  RepositoryInterface,
  createSettingsProvider,
} from '@concepta/nestjs-common';
import {
  PasswordCreationService,
  PasswordStorageService,
} from '@concepta/nestjs-password';
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';

import {
  USER_MODULE_SETTINGS_TOKEN,
  USER_MODULE_USER_ENTITY_KEY,
  USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY,
} from './user.constants';

import { UserOptionsInterface } from './interfaces/user-options.interface';
import { UserOptionsExtrasInterface } from './interfaces/user-options-extras.interface';
import { UserEntitiesOptionsInterface } from './interfaces/user-entities-options.interface';
import { UserSettingsInterface } from './interfaces/user-settings.interface';
import { UserEntityInterface } from './interfaces/user-entity.interface';
import { UserPasswordHistoryEntityInterface } from './interfaces/user-password-history-entity.interface';

import { UserCrudService } from './services/user-crud.service';
import { UserModelService } from './services/user-model.service';
import { UserPasswordService } from './services/user-password.service';
import { UserPasswordHistoryService } from './services/user-password-history.service';
import { UserPasswordHistoryModelService } from './services/user-password-history-model.service';
import { UserAccessQueryService } from './services/user-access-query.service';
import { UserController } from './user.controller';
import { InvitationAcceptedListener } from './listeners/invitation-accepted-listener';
import { userDefaultConfig } from './config/user-default.config';
import { UserMissingEntitiesOptionsException } from './exceptions/user-missing-entities-options.exception';
import { UserModelServiceInterface } from './interfaces/user-model-service.interface';

const RAW_OPTIONS_TOKEN = Symbol('__USER_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: UserModuleClass,
  OPTIONS_TYPE: USER_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: User_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<UserOptionsInterface>({
  moduleName: 'User',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<UserOptionsExtrasInterface>({ global: false }, definitionTransform)
  .build();

export type UserOptions = Omit<typeof USER_OPTIONS_TYPE, 'global'>;
export type UserAsyncOptions = Omit<typeof User_ASYNC_OPTIONS_TYPE, 'global'>;

function definitionTransform(
  definition: DynamicModule,
  extras: UserOptionsExtrasInterface,
): DynamicModule {
  const { providers = [], imports = [] } = definition;
  const {
    global = false,
    entities,
    controllers,
    extraControllers = [],
    extraProviders = [],
  } = extras;

  if (!entities) {
    throw new UserMissingEntitiesOptionsException();
  }

  return {
    ...definition,
    global,
    imports: createUserImports({ imports, entities }),
    providers: createUserProviders({ providers, extraProviders }),
    controllers: createUserControllers({ controllers, extraControllers }),
    exports: [ConfigModule, RAW_OPTIONS_TOKEN, ...createUserExports()],
  };
}

export function createUserImports(
  options: Pick<DynamicModule, 'imports'> & UserEntitiesOptionsInterface,
): Required<Pick<DynamicModule, 'imports'>>['imports'] {
  return [
    ...(options.imports ?? []),
    ConfigModule.forFeature(userDefaultConfig),
    TypeOrmExtModule.forFeature(options.entities),
  ];
}

export function createUserProviders(options: {
  overrides?: UserOptions;
  providers?: Provider[];
  extraProviders?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
    ...(options.extraProviders ?? []),
    UserCrudService,
    PasswordCreationService,
    InvitationAcceptedListener,
    createUserSettingsProvider(options.overrides),
    createUserModelServiceProvider(options.overrides),
    createUserPasswordServiceProvider(options.overrides),
    createUserPasswordHistoryServiceProvider(options.overrides),
    createUserPasswordHistoryModelServiceProvider(),
    createUserAccessQueryServiceProvider(options.overrides),
  ];
}

export function createUserExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    USER_MODULE_SETTINGS_TOKEN,
    UserCrudService,
    UserModelService,
    UserPasswordService,
    UserPasswordHistoryService,
    UserPasswordHistoryModelService,
    UserAccessQueryService,
  ];
}

export function createUserControllers(
  overrides: Pick<UserOptions, 'controllers' | 'extraControllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [UserController, ...(overrides.extraControllers ?? [])];
}

export function createUserSettingsProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return createSettingsProvider<UserSettingsInterface, UserOptionsInterface>({
    settingsToken: USER_MODULE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: userDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createUserModelServiceProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return {
    provide: UserModelService,
    inject: [
      RAW_OPTIONS_TOKEN,
      getDynamicRepositoryToken(USER_MODULE_USER_ENTITY_KEY),
    ],
    useFactory: async (
      options: UserOptionsInterface,
      userRepo: RepositoryInterface<UserEntityInterface>,
    ) =>
      optionsOverrides?.userModelService ??
      options.userModelService ??
      new UserModelService(userRepo),
  };
}

export function createUserPasswordServiceProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return {
    provide: UserPasswordService,
    inject: [
      RAW_OPTIONS_TOKEN,
      UserModelService,
      PasswordCreationService,
      PasswordStorageService,
      {
        token: UserPasswordHistoryService,
        optional: true,
      },
    ],
    useFactory: async (
      options: UserOptionsInterface,
      userModelService: UserModelServiceInterface,
      passwordCreationService: PasswordCreationService,
      passwordStorageService: PasswordStorageService,
      userPasswordHistoryService?: UserPasswordHistoryService,
    ) =>
      optionsOverrides?.userPasswordService ??
      options.userPasswordService ??
      new UserPasswordService(
        userModelService,
        passwordCreationService,
        passwordStorageService,
        userPasswordHistoryService,
      ),
  };
}

export function createUserPasswordHistoryModelServiceProvider(): Provider {
  return {
    provide: UserPasswordHistoryModelService,
    inject: [
      USER_MODULE_SETTINGS_TOKEN,
      {
        token: getDynamicRepositoryToken(
          USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY,
        ),
        optional: true,
      },
    ],
    useFactory: async (
      settings: UserSettingsInterface,
      userPasswordHistoryRepoToken?: RepositoryInterface<UserPasswordHistoryEntityInterface>,
    ) => {
      if (
        settings?.passwordHistory?.enabled === true &&
        userPasswordHistoryRepoToken
      ) {
        return new UserPasswordHistoryModelService(
          userPasswordHistoryRepoToken,
        );
      }
    },
  };
}

export function createUserPasswordHistoryServiceProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return {
    provide: UserPasswordHistoryService,
    inject: [
      RAW_OPTIONS_TOKEN,
      USER_MODULE_SETTINGS_TOKEN,
      {
        token: getDynamicRepositoryToken(
          USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY,
        ),
        optional: true,
      },
      {
        token: UserPasswordHistoryModelService,
        optional: true,
      },
    ],
    useFactory: async (
      options: UserOptionsInterface,
      settings: UserSettingsInterface,
      userPasswordHistoryRepoToken?: RepositoryInterface<UserPasswordHistoryEntityInterface>,
      userPasswordHistoryModelService?: UserPasswordHistoryModelService,
    ) => {
      // if password history is enabled?
      if (settings?.passwordHistory?.enabled === true) {
        // look for an overriding service
        const overridingServiceOption =
          optionsOverrides?.userPasswordHistoryService ??
          options.userPasswordHistoryService;

        // user overriding service, or create default service
        if (overridingServiceOption) {
          return overridingServiceOption;
        } else if (
          userPasswordHistoryRepoToken &&
          userPasswordHistoryModelService
        ) {
          return new UserPasswordHistoryService(
            settings,
            userPasswordHistoryModelService,
          );
        }
      }
    },
  };
}

export function createUserAccessQueryServiceProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return {
    provide: UserAccessQueryService,
    inject: [RAW_OPTIONS_TOKEN, UserPasswordService],
    useFactory: async (options: UserOptionsInterface) =>
      optionsOverrides?.userAccessQueryService ??
      options.userAccessQueryService ??
      new UserAccessQueryService(),
  };
}
