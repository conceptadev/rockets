import { DynamicModule } from '@nestjs/common';

export interface CacheOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {
  entities?: string[];
}
