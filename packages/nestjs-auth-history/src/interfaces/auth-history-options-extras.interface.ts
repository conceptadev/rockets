import { DynamicModule } from '@nestjs/common';
import { AuthHistoryEntitiesOptionsInterface } from './auth-history-entities-options.interface';

export interface AuthHistoryOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<AuthHistoryEntitiesOptionsInterface> {}
