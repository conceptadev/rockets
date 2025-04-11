import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';
import { CacheInterface } from './cache.interface';

export interface CacheClearInterface {
  /**
   * Clear all caches for assign in given category.
   *
   * @param assignment - The assignment of the repository
   * @param cache - The cache to clear
   */
  clear(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assignee'>,
  ): Promise<void>;
}
