import { createSettingsProvider } from '@concepta/nestjs-core';
import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import type {
  AuthBootstrap,
  AuthBootstrapContributions,
  RepositoryBootstrap,
  RepositoryModuleInterface,
  ResourceInput,
  RocketsUserMetadataConfig,
} from '@concepta/rockets-core';
import {
  RocketsCoreModule,
  AuthServerGuard,
  ROCKETS_CORE_SETTINGS_TOKEN,
} from '@concepta/rockets-core';
import { MeController } from './gateways/http/me.controller';
import { RocketsOptionsInterface } from './infrastructure/config/interfaces/rockets-options.interface';
import type { RocketsOptionsExtrasInterface } from './infrastructure/config/interfaces/rockets-options-extras.interface';
import type { RocketsAuthOption } from './infrastructure/config/interfaces/rockets-options-extras.interface';
import { RocketsSettingsInterface } from './infrastructure/config/interfaces/rockets-settings.interface';
import { rocketsOptionsDefaultConfig } from './infrastructure/config/rockets-options-default.config';
import {
  RAW_OPTIONS_TOKEN,
  ROCKETS_USER_METADATA_DTO_TOKEN,
} from './rockets.tokens';

function isAuthBootstrapChain(
  value: RocketsAuthOption,
): value is ReadonlyArray<AuthBootstrap> {
  return Array.isArray(value);
}

export function normalizeAuthBootstraps(
  auth: RocketsAuthOption | undefined,
): ReadonlyArray<AuthBootstrap> {
  if (auth === undefined) {
    return [];
  }
  if (isAuthBootstrapChain(auth)) {
    return [...auth];
  }
  return [auth];
}

export interface ResolvedRocketsComposition {
  readonly auth: ReadonlyArray<AuthBootstrap>;
  readonly resources: ReadonlyArray<ResourceInput>;
  readonly userMetadata?: RocketsUserMetadataConfig;
  readonly repository?: RepositoryModuleInterface | RepositoryBootstrap;
  readonly enableGlobalGuard?: boolean;
}

function resolveSingleContribution<
  Key extends Exclude<keyof AuthBootstrapContributions, 'resources'>,
>(
  bootstraps: ReadonlyArray<AuthBootstrap>,
  key: Key,
): AuthBootstrapContributions[Key] | undefined {
  const values = bootstraps
    .map((bootstrap) => bootstrap.contributes?.[key])
    .filter(
      (value): value is NonNullable<AuthBootstrapContributions[Key]> =>
        value !== undefined,
    );
  if (values.length === 0) return undefined;

  const first = values[0];
  if (values.some((value) => value !== first)) {
    throw new Error(
      `RocketsModule: auth integrations contributed conflicting ${String(
        key,
      )} defaults. Set extras.${String(
        key,
      )} explicitly to resolve the conflict.`,
    );
  }
  return first;
}

/** Resolve explicit app options and integration-owned defaults once. */
export function resolveRocketsComposition(
  extras: RocketsOptionsExtrasInterface = {},
): ResolvedRocketsComposition {
  const auth = normalizeAuthBootstraps(extras.auth);
  const enableGlobalGuard =
    extras.enableGlobalGuard ??
    resolveSingleContribution(auth, 'enableGlobalGuard');

  // A contribution may swap the global guard, never remove it: honoring a
  // contributed `false` with no declared replacement would silently publish
  // every route. Opting out of a guard entirely is the app's call alone.
  if (
    enableGlobalGuard === false &&
    extras.enableGlobalGuard !== false &&
    !auth.some((bootstrap) => bootstrap.contributes?.providesAppGuard === true)
  ) {
    throw new Error(
      'RocketsModule: an auth integration contributed enableGlobalGuard: ' +
        'false without declaring a replacement guard ' +
        '(contributes.providesAppGuard). For an intentionally public API, ' +
        'set enableGlobalGuard: false explicitly on the module options.',
    );
  }

  return {
    auth,
    resources: [
      ...auth.flatMap((bootstrap) => bootstrap.contributes?.resources ?? []),
      ...(extras.resources ?? []),
    ],
    userMetadata:
      extras.userMetadata ?? resolveSingleContribution(auth, 'userMetadata'),
    repository:
      extras.repository ?? resolveSingleContribution(auth, 'repository'),
    enableGlobalGuard,
  };
}

export const {
  ConfigurableModuleClass: RocketsModuleClass,
  OPTIONS_TYPE: ROCKETS_MODULE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: ROCKETS_MODULE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RocketsOptionsInterface>({
  moduleName: 'Rockets',
  optionsInjectionToken: RAW_OPTIONS_TOKEN,
})
  .setExtras<RocketsOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type RocketsOptions = Omit<typeof ROCKETS_MODULE_OPTIONS_TYPE, 'global'>;

export type RocketsAsyncOptions = Omit<
  typeof ROCKETS_MODULE_ASYNC_OPTIONS_TYPE,
  'global'
>;

function definitionTransform(
  definition: DynamicModule,
  extras: RocketsOptionsExtrasInterface,
): DynamicModule {
  const {
    imports = [],
    controllers,
    providers = [],
    exports = [],
  } = definition;

  return {
    ...definition,
    global: extras.global,
    imports: createRocketsImports({
      imports,
      extras,
    }),
    controllers: createRocketsControllers({
      controllers: extras.controllers ?? controllers,
      extras,
    }),
    providers: createRocketsProviders({ providers, extras }),
    exports: createRocketsExports({ exports }),
  };
}

export function createRocketsImports(options: {
  imports: NonNullable<DynamicModule['imports']>;
  extras?: RocketsOptionsExtrasInterface;
}): NonNullable<DynamicModule['imports']> {
  const composition = resolveRocketsComposition(options.extras);
  return [
    ...options.imports,
    RocketsCoreModule.forRootAsync({
      inject: [RAW_OPTIONS_TOKEN],
      useFactory: (opts: RocketsOptionsInterface) => ({
        swagger: opts.swagger,
      }),
      auth: composition.auth,
      userMetadata: composition.userMetadata,
      repository: composition.repository,
      resources: composition.resources,
      handlers: options.extras?.handlers,
      accessControl: options.extras?.accessControl,
      global: true,
    }),
  ];
}

export function createRocketsControllers(options: {
  controllers?: DynamicModule['controllers'];
  extras?: RocketsOptionsExtrasInterface;
}): DynamicModule['controllers'] {
  if (options.controllers !== undefined) {
    return options.controllers;
  }

  const disableController = options.extras?.disableController ?? {};
  const composition = resolveRocketsComposition(options.extras);
  const controllers: DynamicModule['controllers'] = [];

  if (composition.userMetadata && !disableController.me) {
    controllers.push(MeController);
  }

  return controllers;
}

export function createRocketsSettingsProvider(
  optionsOverrides?: RocketsOptionsInterface,
): Provider {
  return createSettingsProvider<
    RocketsSettingsInterface,
    RocketsOptionsInterface
  >({
    settingsToken: ROCKETS_CORE_SETTINGS_TOKEN,
    optionsToken: RAW_OPTIONS_TOKEN,
    settingsKey: rocketsOptionsDefaultConfig.KEY,
    optionsOverrides,
  });
}

export function createRocketsExports(options: {
  exports: DynamicModule['exports'];
}): DynamicModule['exports'] {
  return [
    ...(options.exports ?? []),
    RAW_OPTIONS_TOKEN,
    ROCKETS_CORE_SETTINGS_TOKEN,
  ];
}

export function createRocketsProviders(options: {
  providers?: Provider[];
  extras?: RocketsOptionsExtrasInterface;
}): Provider[] {
  const composition = resolveRocketsComposition(options.extras);
  const extrasUserMetadata = composition.userMetadata;
  const providers: Provider[] = [
    ...(options.providers ?? []),
    createRocketsSettingsProvider(),
  ];

  if (extrasUserMetadata) {
    providers.push({
      provide: ROCKETS_USER_METADATA_DTO_TOKEN,
      useValue: { updateDto: extrasUserMetadata.updateDto },
    });
  }

  if (composition.enableGlobalGuard !== false) {
    providers.push({
      provide: APP_GUARD,
      useClass: AuthServerGuard,
    });
  }

  return providers;
}
