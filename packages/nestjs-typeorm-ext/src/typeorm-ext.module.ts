import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  TypeOrmModule,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-core';
import {
  TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
  TYPEORM_EXT_MODULE_OPTIONS_TOKEN,
} from './typeorm-ext.constants';
import {
  TypeOrmExtConnectionToken,
  TypeOrmExtOptions,
} from './typeorm-ext.types';
import { TypeOrmExtEntityOptionInterface } from './interfaces/typeorm-ext-entity-options.interface';
import { resolveConnectionName } from './utils/resolve-connection-name';
import { createEntityRepositoryProvider } from './utils/create-entity-repository-provider';
import { createDynamicRepositoryProvider } from './utils/create-dynamic-repository-provider';

@Global()
@Module({})
export class TypeOrmExtModule extends createConfigurableDynamicRootModule<
  TypeOrmExtModule,
  TypeOrmExtOptions
>(TYPEORM_EXT_MODULE_OPTIONS_TOKEN, {
  exports: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
}) {
  static register(options: TypeOrmExtOptions) {
    const module = TypeOrmExtModule.forRoot(TypeOrmExtModule, options);

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(
      TypeOrmModule.forRootAsync({
        name: options?.name
          ? options.name
          : TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
        inject: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
        useFactory: async (options: TypeOrmModuleOptions) => options,
      }),
    );

    module.global = true;
    return module;
  }

  static registerAsync(
    options: TypeOrmModuleAsyncOptions & AsyncModuleConfig<TypeOrmExtOptions>,
  ) {
    const module = TypeOrmExtModule.forRootAsync(TypeOrmExtModule, options);

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(
      TypeOrmModule.forRootAsync({
        inject: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
        useFactory: async (options: TypeOrmModuleOptions) => options,
      }),
    );

    module.global = true;
    return module;
  }

  static forFeature(
    entityOptions: Record<string, TypeOrmExtEntityOptionInterface>,
  ): DynamicModule {
    const connections: Record<string, TypeOrmExtConnectionToken> = {};

    const entitiesByConn: Record<string, EntityClassOrSchema[]> = {};

    const imports: DynamicModule[] = [];

    const providers: Provider[] = [];

    for (const entityKey in entityOptions) {
      const {
        entity,
        repositoryFactory,
        connection = TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
      } = entityOptions[entityKey];

      const connectionName = resolveConnectionName(connection);

      if (connectionName in connections === false) {
        connections[connectionName] = connection;
      }

      if (connectionName in entitiesByConn === false) {
        entitiesByConn[connectionName] = [];
      }

      entitiesByConn[connectionName].push(entity);

      providers.push(
        createEntityRepositoryProvider(entityKey, entity, connection),
        createDynamicRepositoryProvider(
          entityKey,
          entity,
          repositoryFactory,
          connection,
        ),
      );
    }

    for (const connectionName in entitiesByConn) {
      imports.push(
        TypeOrmModule.forFeature(
          entitiesByConn[connectionName],
          connections[connectionName],
        ),
      );
    }

    return {
      module: TypeOrmExtModule,
      imports,
      providers,
      exports: providers,
    };
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<TypeOrmExtModule, TypeOrmExtOptions>(
      TypeOrmExtModule,
      options,
    );
  }
}
