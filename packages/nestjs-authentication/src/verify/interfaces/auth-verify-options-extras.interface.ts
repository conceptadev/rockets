import { DynamicModule } from '@nestjs/common';

export interface AuthVerifyOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'> {}
