import {
  CacheInterface,
  RepositoryEntityOptionInterface,
} from '@concepta/nestjs-common';

export interface CacheEntitiesOptionsInterface
  extends Record<string, RepositoryEntityOptionInterface<CacheInterface>> {}
