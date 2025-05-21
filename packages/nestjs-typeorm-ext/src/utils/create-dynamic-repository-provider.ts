import { DataSource } from 'typeorm';
import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { getDynamicRepositoryToken } from '@concepta/nestjs-common';
import { TypeOrmExtDataSourceToken } from '../typeorm-ext.types';
import { TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME } from '../typeorm-ext.constants';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { TypeOrmExtEntityOptionInterface } from '../interfaces/typeorm-ext-entity-options.interface';
import { TypeOrmRepositoryAdapter } from '../repository/typeorm-repository.adapter';

/**
 *  Create dynamic repository provider function
 *
 * @param key - repository key
 * @param entity - the entity
 * @param dataSource - the data source
 * @param repositoryFactory - the repository
 * @returns Repository provider
 */
export function createDynamicRepositoryProvider(
  key: string,
  entity: EntityClassOrSchema,
  dataSource: TypeOrmExtDataSourceToken = TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME,
  repositoryFactory?: TypeOrmExtEntityOptionInterface['repositoryFactory'],
): Provider {
  if (repositoryFactory) {
    return {
      provide: getDynamicRepositoryToken(key),
      inject: [getDataSourceToken(dataSource)],
      useFactory: (dataSource: DataSource) => {
        return new TypeOrmRepositoryAdapter(repositoryFactory(dataSource));
      },
    };
  } else {
    return {
      provide: getDynamicRepositoryToken(key),
      inject: [getRepositoryToken(entity, dataSource)],
      useFactory: (repoInstance) => {
        return new TypeOrmRepositoryAdapter(repoInstance);
      },
    };
  }
}
