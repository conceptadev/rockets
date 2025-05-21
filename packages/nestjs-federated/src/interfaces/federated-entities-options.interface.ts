import {
  FederatedEntityInterface,
  RepositoryEntityOptionInterface,
} from '@concepta/nestjs-common';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';

export interface FederatedEntitiesOptionsInterface {
  [FEDERATED_MODULE_FEDERATED_ENTITY_KEY]: RepositoryEntityOptionInterface<FederatedEntityInterface>;
}
