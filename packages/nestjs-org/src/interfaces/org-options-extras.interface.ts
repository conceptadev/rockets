import { DynamicModule } from '@nestjs/common';
import { OrgEntitiesOptionsInterface } from './org-entities-options.interface';
import { OrgCrudBuilder } from '../utils/org.crud-builder';

export interface OrgOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<OrgEntitiesOptionsInterface> {
  orgCrudBuilder?: OrgCrudBuilder;
}
