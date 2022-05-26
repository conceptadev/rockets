import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';
import { FederatedEntityInterface } from './federated-entity.interface';

export interface FederatedEntitiesOptionsInterface {
  entities: {
    [FEDERATED_MODULE_FEDERATED_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<FederatedEntityInterface>;
  };
}
