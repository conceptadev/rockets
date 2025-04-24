import { CacheInterface } from './cache.interface';

export interface CacheUpdatableInterface
  extends Pick<CacheInterface, 'key' | 'type' | 'data' | 'assigneeId'> {
  expiresIn: string | null;
}
