import { DynamicModule } from '@nestjs/common';

export interface FederatedOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {}
