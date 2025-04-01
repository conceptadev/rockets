import { DynamicModule } from '@nestjs/common';

export interface JwtOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'imports'> {}
