import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';

import { CacheInterface } from './cache.interface';

export interface CacheGetOneInterface {
  /**
   * Get One cache based on params
   *
   * @param assignment - The cache assignment
   * @param cache - The dto with unique keys to delete
   */
  get(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assigneeId'>,
  ): Promise<CacheInterface | null>;
}
