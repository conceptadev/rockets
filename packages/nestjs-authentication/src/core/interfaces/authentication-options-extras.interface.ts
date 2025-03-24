import { DynamicModule } from '@nestjs/common';

export interface AuthenticationOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {}
