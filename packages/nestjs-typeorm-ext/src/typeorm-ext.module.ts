import { Connection, ConnectionOptions } from 'typeorm';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  getConnectionToken,
  getRepositoryToken,
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
import { TypeOrmExtService } from './typeorm-ext.service';
import {
  TYPEORM_EXT_MODULE_CONNECTION,
  TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
  TYPEORM_EXT_MODULE_OPTIONS_TOKEN,
} from './typeorm-ext.constants';
import { TypeOrmExtOptions } from './typeorm-ext.types';
import { TypeOrmExtStorage } from './typeorm-ext.storage';
import { TypeOrmExtMetadataInterface } from './interfaces/typeorm-ext-metadata.interface';
import { TypeOrmExtTestOptionsInterface } from './interfaces/typeorm-ext-test-options.interface';
import { createTestConnectionFactory } from './utils/create-test-connection-factory';
import { TypeOrmExtEntityOptionInterface } from './interfaces/typeorm-ext-entity-options.interface';
import { getDynamicRepositoryToken } from './utils/get-dynamic-repository-token';
import { getEntityRepositoryToken } from './utils/get-entity-repository-token';

@Global()
@Module({
  providers: [TypeOrmExtService],
  exports: [TypeOrmExtService],
})
export class TypeOrmExtModule extends createConfigurableDynamicRootModule<
  TypeOrmExtModule,
  TypeOrmExtOptions
>(TYPEORM_EXT_MODULE_OPTIONS_TOKEN, {
  exports: [TYPEORM_EXT_MODULE_CONNECTION, TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
}) {
  static register(options: TypeOrmExtOptions) {
    const module = TypeOrmExtModule.forRoot(TypeOrmExtModule, options);

    module.imports.push(
      TypeOrmModule.forRootAsync({
        inject: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
        useFactory: async (options: TypeOrmModuleOptions & ConnectionOptions) =>
          options,
      }),
    );

    module.providers.push(
      this.createConnectionProvider(options as ConnectionOptions),
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

    module.providers.push(this.createConnectionProvider(options.name));
    module.global = true;
    return module;
  }

  static forFeature<T>(
    entityOptions: Record<string, TypeOrmExtEntityOptionInterface<T>>,
  ): DynamicModule {
    const connections: Record<string, Connection | ConnectionOptions | string> =
      {};
    const entitiesToRegister: Record<string, EntityClassOrSchema[]> = {};
    const imports: DynamicModule[] = [];
    const providers: Provider[] = [];

    for (const entityKey in entityOptions) {
      const {
        entity,
        repository,
        connection = TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
      } = entityOptions[entityKey];

      const connectionName = this.getConnectionName(connection);

      if (connectionName in connections === false) {
        connections[connectionName] = connection;
      }

      if (connectionName in entitiesToRegister === false) {
        entitiesToRegister[connectionName] = [];
      }

      entitiesToRegister[connectionName].push(entity);

      providers.push({
        provide: getEntityRepositoryToken(entityKey),
        useExisting: getRepositoryToken(entity),
      });

      if (repository) {
        entitiesToRegister[connectionName].push(repository);
        providers.push({
          provide: getDynamicRepositoryToken(entityKey),
          useExisting: getRepositoryToken(repository),
        });
      } else {
        providers.push({
          provide: getDynamicRepositoryToken(entityKey),
          useExisting: getRepositoryToken(entity),
        });
      }
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

  static configure(
    metadata: TypeOrmExtMetadataInterface,
    defaultMetadata: TypeOrmExtMetadataInterface = {},
  ) {
    TypeOrmExtStorage.addConfig(metadata, defaultMetadata);
  }

  private static createConnectionProvider(
    connection?: string | ConnectionOptions,
  ) {
    return {
      provide: TYPEORM_EXT_MODULE_CONNECTION,
      inject: [getConnectionToken(connection)],
      useFactory: async (connection: Connection) => connection,
    };
  }

  private static getConnectionName(
    connection: Connection | ConnectionOptions | string,
  ): string {
    return typeof connection === 'string' ? connection : connection.name;
  }
}
