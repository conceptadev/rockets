import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';
import { CacheInterface } from './cache.interface';

export interface CacheDeleteInterface {
  /**
   * Delete a cache based on params
   *
   * @param assignment - The cache assignment
   * @param cache - The dto with unique keys to delete
   */
  delete(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assignee'>,
  ): Promise<void>;
}
