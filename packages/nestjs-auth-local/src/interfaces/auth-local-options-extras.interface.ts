import { DynamicModule } from '@nestjs/common';

export interface AuthLocalOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'> {}
