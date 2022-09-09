import { DynamicModule } from '@nestjs/common';
import { OrgEntitiesOptionsInterface } from './org-entities-options.interface';

export interface OrgOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<OrgEntitiesOptionsInterface> {}
