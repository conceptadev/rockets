import { Provider, Type } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';
import { getEntityRepositoryToken } from './get-entity-repository-token';

/**
 * Create an entity repository provider function
 *
 * @param key Entity key
 * @param entity The entity
 * @returns {Provider} Repository provider
 */
export function createEntityRepositoryProvider<T>(
  key: string,
  entity: Type<T> | EntitySchema,
): Provider {
  return {
    provide: getEntityRepositoryToken(key),
    useExisting: getRepositoryToken(entity),
  };
}
