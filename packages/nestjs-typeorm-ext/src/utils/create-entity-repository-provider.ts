import { Provider, Type } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';
import { getEntityRepositoryToken } from './get-entity-repository-token';
import { TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME } from '../typeorm-ext.constants';

/**
 * Create an entity repository provider function
 *
 * @param key Entity key
 * @param entity The entity
 * @param connection The connection
 * @returns {Provider} Repository provider
 */
export function createEntityRepositoryProvider<T>(
  key: string,
  entity: Type<T> | EntitySchema,
  connection: TypeOrmExtConnectionToken = TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
): Provider {
  return {
    provide: getEntityRepositoryToken(key),
    useExisting: getRepositoryToken(entity, connection),
  };
}
