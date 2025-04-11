import { ReferenceAssignment } from '@concepta/nestjs-common';
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
  extends CacheCreateInterface,
    CacheDeleteInterface,
    CacheUpdateInterface,
    CacheGetOneInterface,
    CacheClearInterface {
  updateOrCreate(
    assignment: ReferenceAssignment,
    cache: CacheCreatableInterface,
  ): Promise<CacheInterface>;

  getAssignedCaches(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assignee'>,
  ): Promise<CacheInterface[]>;
}
