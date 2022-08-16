import { DynamicModule } from '@nestjs/common';

export interface AuthRecoveryOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'> {}
