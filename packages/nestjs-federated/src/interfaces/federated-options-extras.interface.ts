import { DynamicModule } from '@nestjs/common';
import { FederatedEntitiesOptionsInterface } from './federated-entities-options.interface';

export interface FederatedOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'>,
    Partial<FederatedEntitiesOptionsInterface> {}
