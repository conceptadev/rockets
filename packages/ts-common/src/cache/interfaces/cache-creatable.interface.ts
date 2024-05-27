import { CacheInterface } from './cache.interface';

export interface CacheCreatableInterface
  extends Pick<CacheInterface, 'key' | 'type' | 'data' | 'assignee'> {
  expiresIn: string | null;
}
