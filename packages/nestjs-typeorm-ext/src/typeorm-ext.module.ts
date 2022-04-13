import { Connection, ConnectionOptions } from 'typeorm';
import { Global, Module } from '@nestjs/common';
import {
  getConnectionName,
  getConnectionToken,
  TypeOrmModule,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-common';
import { TypeOrmExtService } from './typeorm-ext.service';
import {
  TYPEORM_EXT_MODULE_CONNECTION,
  TYPEORM_EXT_MODULE_OPTIONS_TOKEN,
} from './typeorm-ext.constants';
import { TypeOrmExtOptions } from './typeorm-ext.types';
import { TypeOrmExtStorage } from './typeorm-ext.storage';
import { TypeOrmExtMetadataInterface } from './interfaces/typeorm-ext-metadata.interface';
import { TypeOrmExtTestOptionsInterface } from './interfaces/typeorm-ext-test-options.interface';
import { createTestConnectionFactory } from './utils/create-test-connection-factory';

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
        useFactory: async (options: TypeOrmModuleOptions) => {
          // return the merged options
          return TypeOrmExtModule.mergeTypeOrmOptions(
            getConnectionName(options as ConnectionOptions),
            options as ConnectionOptions,
          );
        },
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
        useFactory: async (options: TypeOrmModuleOptions) => {
          // return the merged options
          return TypeOrmExtModule.mergeTypeOrmOptions(
            getConnectionName(options as ConnectionOptions),
            options as ConnectionOptions,
          );
        },
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

  private static mergeTypeOrmOptions(
    connectionName: string,
    options: ConnectionOptions,
  ) {
    const entities = TypeOrmExtStorage.getEntitiesByConnection(connectionName);

    const subscribers =
      TypeOrmExtStorage.getSubscribersByConnection(connectionName);

    return {
      ...options,
      entities: [
        ...(options.entities ?? []),
        ...(entities ? entities.map((entity) => entity.useClass) : []),
      ],
      subscribers: [
        ...(options.subscribers ?? []),
        ...(subscribers
          ? subscribers.map((subscriber) => subscriber.useClass)
          : []),
      ],
    };
  }
}
