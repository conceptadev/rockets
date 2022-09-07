import { DynamicModule } from '@nestjs/common';
import { RoleEntitiesOptionsInterface } from './role-entities-options.interface';

export interface RoleOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<RoleEntitiesOptionsInterface> {}
