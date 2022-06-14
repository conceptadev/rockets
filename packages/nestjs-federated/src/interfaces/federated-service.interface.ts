import { FederatedEntityInterface } from './federated-entity.interface';

export interface FederatedServiceInterface {
  exists(
    provider: string,
    federatedRef: string,
  ): Promise<FederatedEntityInterface | undefined>;
}
