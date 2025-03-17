import { DynamicModule } from '@nestjs/common';
import { InvitationEntitiesOptionsInterface } from './invitation-entities-options.interface';

export interface InvitationOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<InvitationEntitiesOptionsInterface> {}
