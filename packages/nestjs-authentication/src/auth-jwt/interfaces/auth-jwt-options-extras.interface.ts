import { DynamicModule } from '@nestjs/common';

export interface AuthJwtOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {}
