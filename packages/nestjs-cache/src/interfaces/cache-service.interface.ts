import { ReferenceAssignment } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import {
  CacheClearInterface,
  CacheCreatableInterface,
  CacheCreateInterface,
  CacheDeleteInterface,
  CacheGetOneInterface,
  CacheInterface,
  CacheUpdateInterface,
} from '@concepta/nestjs-common';

export interface CacheServiceInterface
  extends CacheCreateInterface<QueryOptionsInterface>,
    CacheDeleteInterface<QueryOptionsInterface>,
    CacheUpdateInterface<QueryOptionsInterface>,
    CacheGetOneInterface<QueryOptionsInterface>,
    CacheClearInterface<QueryOptionsInterface> {
  updateOrCreate(
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
