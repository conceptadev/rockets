import { ReferenceAssignment } from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import {
  CacheClearInterface,
  CacheCreatableInterface,
  CacheCreateInterface,
  CacheDeleteInterface,
  CacheGetOneInterface,
  CacheInterface,
  CacheUpdateInterface,
} from '@concepta/ts-common';

export interface CacheServiceInterface
  extends CacheCreateInterface<QueryOptionsInterface>,
    CacheDeleteInterface<QueryOptionsInterface>,
    CacheUpdateInterface<QueryOptionsInterface>,
    CacheGetOneInterface<QueryOptionsInterface>,
    CacheClearInterface<QueryOptionsInterface> {
  // TODO: should i create a unique interface for save?
  save(
    assignment: ReferenceAssignment,
    cache: CacheCreatableInterface,
    options?: QueryOptionsInterface,
  ): Promise<CacheInterface>;

  getAssignedCaches(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assignee'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface[]>;
}
