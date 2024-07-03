import {
  ReferenceAssignment,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';
import { CacheInterface } from './cache.interface';

export interface CacheDeleteInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Delete a cache based on params
   * @param assignment - The cache assignment
   * @param cache - The dto with unique keys to delete
   */
  delete(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assignee'>,
    options?: O,
  ): Promise<void>;
}
