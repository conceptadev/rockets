import { CacheException } from './cache.exception';

export class CacheMissingEntitiesOptionException extends CacheException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'CACHE_MISSING_ENTITIES_OPTION';
  }
}
