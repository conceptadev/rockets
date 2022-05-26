import { EntitySchema, Repository } from 'typeorm';
import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  TypeOrmModule,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
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
import { TypeOrmExtTestOptionsInterface } from './interfaces/typeorm-ext-test-options.interface';
import { createTestConnectionFactory } from './utils/create-test-connection-factory';
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

    module.imports.push(
      TypeOrmModule.forRootAsync({
        inject: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
        useFactory: async (options: TypeOrmModuleOptions) => options,
      }),
    );

    module.global = true;
    return module;
  }

  static registerAsync(
    options: TypeOrmModuleAsyncOptions &
      AsyncModuleConfig<TypeOrmExtOptions> &
      TypeOrmExtTestOptionsInterface,
  ) {
    const module = TypeOrmExtModule.forRootAsync(TypeOrmExtModule, options);

    module.imports.push(
      TypeOrmModule.forRootAsync({
        inject: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
        useFactory: async (options: TypeOrmModuleOptions) => options,
        connectionFactory:
          options.testMode === true
            ? createTestConnectionFactory
            : options.connectionFactory,
      }),
    );

    module.global = true;
    return module;
  }

  static forFeature<T>(
    entityOptions: Record<string, TypeOrmExtEntityOptionInterface<T>>,
  ): DynamicModule {
    const connections: Record<string, TypeOrmExtConnectionToken> = {};

    const entitiesToRegister: Record<
      string,
      (Type<T> | Type<Repository<T>> | EntitySchema<T>)[]
    > = {};

    const imports: DynamicModule[] = [];

    const providers: Provider[] = [];

    for (const entityKey in entityOptions) {
      const {
        entity,
        repository,
        connection = TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
      } = entityOptions[entityKey];

      const connectionName = resolveConnectionName(connection);

      if (connectionName in connections === false) {
        connections[connectionName] = connection;
      }

      if (connectionName in entitiesToRegister === false) {
        entitiesToRegister[connectionName] = [];
      }

      entitiesToRegister[connectionName].push(entity);

      if (repository) {
        entitiesToRegister[connectionName].push(repository);
      }

      providers.push(
        createEntityRepositoryProvider(entityKey, entity),
        createDynamicRepositoryProvider(entityKey, entity, repository),
      );
    }

    for (const connectionName in entitiesToRegister) {
      imports.push(
        TypeOrmModule.forFeature(
          entitiesToRegister[connectionName],
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
