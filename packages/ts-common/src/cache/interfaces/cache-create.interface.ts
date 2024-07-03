import {
  ReferenceAssignment,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';

import { CacheCreatableInterface } from './cache-creatable.interface';
import { CacheInterface } from './cache.interface';

export interface CacheCreateInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Create a cache with a for the given assignee.
   *
   * @param assignment - The cache assignment
   * @param cache - The CACHE to create
   */
  create(
    assignment: ReferenceAssignment,
    cache: CacheCreatableInterface,
    options?: O,
  ): Promise<CacheInterface>;
}
