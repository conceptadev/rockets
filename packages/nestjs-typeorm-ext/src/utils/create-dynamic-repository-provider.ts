import { Provider, Type } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntitySchema, Repository } from 'typeorm';
import { getDynamicRepositoryToken } from './get-dynamic-repository-token';

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
): Provider {
  if (repository) {
    return {
      provide: getDynamicRepositoryToken(key),
      useExisting: getRepositoryToken(repository),
    };
  } else {
    return {
      provide: getDynamicRepositoryToken(key),
      useExisting: getRepositoryToken(entity),
    };
  }
}
