import { DynamicModule } from '@nestjs/common';

export interface AccessControlOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'imports'> {}
