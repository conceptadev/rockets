import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { FederatedEntityInterface } from './federated-entity.interface';

export interface FederatedServiceInterface {
  exists(
    provider: string,
    federatedRef: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<FederatedEntityInterface | null>;
}
