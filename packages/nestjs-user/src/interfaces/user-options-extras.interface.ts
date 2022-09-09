import { DynamicModule } from '@nestjs/common';
import { UserEntitiesOptionsInterface } from './user-entities-options.interface';

export interface UserOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<UserEntitiesOptionsInterface> {}
