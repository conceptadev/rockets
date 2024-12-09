import { CacheInterface } from './cache.interface';

export interface CacheUpdatableInterface
  extends Pick<CacheInterface, 'key' | 'type' | 'data' | 'assignee'> {
  expiresIn: string | null;
}
