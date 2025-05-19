import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';
import { FederatedEntityInterface } from '@concepta/nestjs-common';

export interface FederatedEntitiesOptionsInterface {
  [FEDERATED_MODULE_FEDERATED_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<FederatedEntityInterface>;
}
