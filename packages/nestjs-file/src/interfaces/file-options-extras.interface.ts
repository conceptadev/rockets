import { DynamicModule } from '@nestjs/common';

export interface FileOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {}
