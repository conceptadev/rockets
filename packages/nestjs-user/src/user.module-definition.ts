import { Repository } from 'typeorm';
import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createSettingsProvider } from '@concepta/nestjs-common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';

import {
  USER_MODULE_SETTINGS_TOKEN,
  USER_MODULE_USER_ENTITY_KEY,
} from './user.constants';

import { UserOptionsInterface } from './interfaces/user-options.interface';
import { UserOptionsExtrasInterface } from './interfaces/user-options-extras.interface';
import { UserEntitiesOptionsInterface } from './interfaces/user-entities-options.interface';
import { UserSettingsInterface } from './interfaces/user-settings.interface';
import { UserEntityInterface } from './interfaces/user-entity.interface';

import { UserCrudService } from './services/user-crud.service';
import { UserLookupService } from './services/user-lookup.service';
import { UserMutateService } from './services/user-mutate.service';
import { UserController } from './user.controller';
import { InvitationAcceptedListener } from './listeners/invitation-accepted-listener';
import { InvitationGetUserListener } from './listeners/invitation-get-user.listener';
import { userDefaultConfig } from './config/user-default.config';

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
  const { controllers, global = false, entities } = extras;

  if (!entities) {
    throw new Error('You must provide the entities option');
  }

  return {
    ...definition,
    global,
    imports: createUserImports({ imports, entities }),
    providers: createUserProviders({ providers }),
    controllers: createUserControllers({ controllers }),
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
}): Provider[] {
  return [
    ...(options.providers ?? []),
    UserCrudService,
    PasswordStorageService,
    InvitationAcceptedListener,
    InvitationGetUserListener,
    createUserSettingsProvider(options.overrides),
    createUserLookupServiceProvider(options.overrides),
    createUserMutateServiceProvider(options.overrides),
  ];
}

export function createUserExports(): Required<
  Pick<DynamicModule, 'exports'>
>['exports'] {
  return [
    USER_MODULE_SETTINGS_TOKEN,
    UserLookupService,
    UserMutateService,
    UserCrudService,
  ];
}

export function createUserControllers(
  overrides: Pick<UserOptions, 'controllers'> = {},
): DynamicModule['controllers'] {
  return overrides?.controllers !== undefined
    ? overrides.controllers
    : [UserController];
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

export function createUserLookupServiceProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return {
    provide: UserLookupService,
    inject: [
      RAW_OPTIONS_TOKEN,
      getDynamicRepositoryToken(USER_MODULE_USER_ENTITY_KEY),
    ],
    useFactory: async (
      options: UserOptionsInterface,
      UserRepo: Repository<UserEntityInterface>,
    ) =>
      optionsOverrides?.userLookupService ??
      options.userLookupService ??
      new UserLookupService(UserRepo),
  };
}

export function createUserMutateServiceProvider(
  optionsOverrides?: UserOptions,
): Provider {
  return {
    provide: UserMutateService,
    inject: [
      RAW_OPTIONS_TOKEN,
      getDynamicRepositoryToken(USER_MODULE_USER_ENTITY_KEY),
      PasswordStorageService,
    ],
    useFactory: async (
      options: UserOptionsInterface,
      userRepo: Repository<UserEntityInterface>,
      passwordStorageService: PasswordStorageService,
    ) =>
      optionsOverrides?.userLookupService ??
      options.userLookupService ??
      new UserMutateService(userRepo, passwordStorageService),
  };
}
