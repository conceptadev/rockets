import { ReferenceAssignment } from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import {
  CacheClearInterface,
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
  getAssignedCaches(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assignee'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface[]>;
}
