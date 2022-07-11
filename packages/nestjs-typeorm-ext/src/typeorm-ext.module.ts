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
  TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME,
  TYPEORM_EXT_MODULE_OPTIONS_TOKEN,
} from './typeorm-ext.constants';
import {
  TypeOrmExtDataSourceToken,
  TypeOrmExtOptions,
} from './typeorm-ext.types';
import { TypeOrmExtEntityOptionInterface } from './interfaces/typeorm-ext-entity-options.interface';
import { resolveDataSourceName } from './utils/resolve-data-source-name';
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
          : TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME,
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
    const dataSources: Record<string, TypeOrmExtDataSourceToken> = {};

    const entitiesByDS: Record<string, EntityClassOrSchema[]> = {};

    const imports: DynamicModule[] = [];

    const providers: Provider[] = [];

    for (const entityKey in entityOptions) {
      const {
        entity,
        repositoryFactory,
        dataSource = TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME,
      } = entityOptions[entityKey];

      const dsName = resolveDataSourceName(dataSource);

      if (dsName in dataSources === false) {
        dataSources[dsName] = dataSource;
      }

      if (dsName in entitiesByDS === false) {
        entitiesByDS[dsName] = [];
      }

      entitiesByDS[dsName].push(entity);

      providers.push(
        createEntityRepositoryProvider(entityKey, entity, dataSource),
        createDynamicRepositoryProvider(
          entityKey,
          entity,
          repositoryFactory,
          dataSource,
        ),
      );
    }

    for (const dsName in entitiesByDS) {
      imports.push(
        TypeOrmModule.forFeature(entitiesByDS[dsName], dataSources[dsName]),
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
