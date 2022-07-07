import { DataSource } from 'typeorm';
import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';
import { getDynamicRepositoryToken } from './get-dynamic-repository-token';
import { TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME } from '../typeorm-ext.constants';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { TypeOrmExtEntityOptionInterface } from '../interfaces/typeorm-ext-entity-options.interface';

/**
 *  Create dynamic repository provider function
 *
 * @param key repository key
 * @param entity the entity
 * @param repositoryFactory the repository
 * @returns Repository provider
 */
export function createDynamicRepositoryProvider(
  key: string,
  entity: EntityClassOrSchema,
  repositoryFactory?: TypeOrmExtEntityOptionInterface['repositoryFactory'],
  connection: TypeOrmExtConnectionToken = TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
): Provider {
  if (repositoryFactory) {
    return {
      provide: getDynamicRepositoryToken(key),
      inject: [getDataSourceToken(connection)],
      useFactory: (dataSource: DataSource) => {
        return repositoryFactory(dataSource);
      },
    };
  } else {
    return {
      provide: getDynamicRepositoryToken(key),
      useExisting: getRepositoryToken(entity, connection),
    };
  }
}
