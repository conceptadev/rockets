import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {
  TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME,
  TYPEORM_EXT_MODULE_OPTIONS_TOKEN,
} from './typeorm-ext.constants';

import { TypeOrmExtDataSourceToken } from './typeorm-ext.types';

import { TypeOrmExtEntityOptionInterface } from './interfaces/typeorm-ext-entity-options.interface';
import { resolveDataSourceName } from './utils/resolve-data-source-name';
import { createDynamicRepositoryProvider } from './utils/create-dynamic-repository-provider';

import {
  TypeOrmExtModuleClass,
  TypeOrmExtOptions,
  TypeOrmExtAsyncOptions,
} from './typeorm-ext.module-definition';

@Global()
@Module({})
export class TypeOrmExtModule extends TypeOrmExtModuleClass {
  static forRoot(options: TypeOrmExtOptions) {
    const module = super.forRoot(options);

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

    return module;
  }

  static forRootAsync(options: TypeOrmExtAsyncOptions) {
    const module = super.forRootAsync(options);

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(
      TypeOrmModule.forRootAsync({
        inject: [TYPEORM_EXT_MODULE_OPTIONS_TOKEN],
        useFactory: async (options: TypeOrmModuleOptions) => options,
      }),
    );

    return module;
  }

  static forFeature<T extends Record<string, TypeOrmExtEntityOptionInterface>>(
    entityOptions: T,
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
        createDynamicRepositoryProvider(
          entityKey,
          entity,
          dataSource,
          repositoryFactory,
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
}
