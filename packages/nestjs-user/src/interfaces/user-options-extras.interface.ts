import { DynamicModule } from '@nestjs/common';

export interface UserOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {}
