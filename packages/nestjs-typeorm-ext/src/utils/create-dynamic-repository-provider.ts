import { Provider, Type } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntitySchema, Repository } from 'typeorm';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';
import { getDynamicRepositoryToken } from './get-dynamic-repository-token';
import { TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME } from '../typeorm-ext.constants';

/**
 *  Create dynamic repository provider function
 *
 * @param key repository key
 * @param entity the entity
 * @param repository the repository
 * @returns Repository provider
 */
export function createDynamicRepositoryProvider<T>(
  key: string,
  entity: Type<T> | EntitySchema<T>,
  repository?: Type<Repository<T>>,
  connection: TypeOrmExtConnectionToken = TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
): Provider {
  if (repository) {
    return {
      provide: getDynamicRepositoryToken(key),
      useExisting: getRepositoryToken(repository, connection),
    };
  } else {
    return {
      provide: getDynamicRepositoryToken(key),
      useExisting: getRepositoryToken(entity, connection),
    };
  }
}
