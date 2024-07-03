import {
  ReferenceAssignment,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';
import { CacheUpdatableInterface } from './cache-updatable.interface';
import { CacheInterface } from './cache.interface';

export interface CacheUpdateInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Update a cache based on params
   * @param assignment - The cache assignment
   * @param cache - The dto with unique keys to delete
   */
  update(
    assignment: ReferenceAssignment,
    cache: CacheUpdatableInterface,
    options?: O,
  ): Promise<CacheInterface>;
}
