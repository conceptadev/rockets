import { DynamicModule } from '@nestjs/common';

export interface OrgOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {}
