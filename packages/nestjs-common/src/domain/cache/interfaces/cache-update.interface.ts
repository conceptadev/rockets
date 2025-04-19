import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';
import { CacheUpdatableInterface } from './cache-updatable.interface';
import { CacheInterface } from './cache.interface';

export interface CacheUpdateInterface {
  /**
   * Update a cache based on params
   *
   * @param assignment - The cache assignment
   * @param cache - The dto with unique keys to delete
   */
  update(
    assignment: ReferenceAssignment,
    cache: CacheUpdatableInterface,
  ): Promise<CacheInterface>;
}
