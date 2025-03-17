import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';

import { CacheInterface } from './cache.interface';

export interface CacheGetOneInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Get One cache based on params
   *
   * @param assignment - The cache assignment
   * @param cache - The dto with unique keys to delete
   */
  get(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assignee'>,
    queryOptions?: O,
  ): Promise<CacheInterface | null>;
}
