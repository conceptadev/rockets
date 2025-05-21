import { DynamicModule } from '@nestjs/common';

export interface RoleOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {
  entities?: string[];
}
