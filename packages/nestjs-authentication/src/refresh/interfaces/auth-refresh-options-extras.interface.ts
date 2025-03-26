import { DynamicModule } from '@nestjs/common';

export interface AuthRefreshOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'> {}
