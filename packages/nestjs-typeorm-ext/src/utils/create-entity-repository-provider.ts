import { Provider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmExtDataSourceToken } from '../typeorm-ext.types';
import { getEntityRepositoryToken } from './get-entity-repository-token';
import { TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME } from '../typeorm-ext.constants';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

/**
 * Create an entity repository provider function
 *
 * @param key - Entity key
 * @param entity - The entity
 * @param dataSource - The data source
 * @returns Repository provider
 */
export function createEntityRepositoryProvider(
  key: string,
  entity: EntityClassOrSchema,
  dataSource: TypeOrmExtDataSourceToken = TYPEORM_EXT_MODULE_DEFAULT_DATA_SOURCE_NAME,
): Provider {
  return {
    provide: getEntityRepositoryToken(key),
    useExisting: getRepositoryToken(entity, dataSource),
  };
}
