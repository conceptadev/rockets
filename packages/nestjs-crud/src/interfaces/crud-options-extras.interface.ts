import { DynamicModule } from '@nestjs/common';

export interface CrudOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'imports'> {}
