import { DynamicModule } from '@nestjs/common';
import { CacheEntitiesOptionsInterface } from './cache-entities-options.interface';

export interface CacheOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<CacheEntitiesOptionsInterface> {}
