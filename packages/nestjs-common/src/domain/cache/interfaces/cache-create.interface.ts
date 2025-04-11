import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';

import { CacheCreatableInterface } from './cache-creatable.interface';
import { CacheInterface } from './cache.interface';

export interface CacheCreateInterface {
  /**
   * Create a cache with a for the given assignee.
   *
   * @param assignment - The cache assignment
   * @param cache - The CACHE to create
   */
  create(
    assignment: ReferenceAssignment,
    cache: CacheCreatableInterface,
  ): Promise<CacheInterface>;
}
