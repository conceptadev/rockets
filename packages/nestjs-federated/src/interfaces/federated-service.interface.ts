import { FederatedCreatableInterface } from "./federated-creatable.interface";
import { FederatedEntityInterface } from "./federated-entity.interface";

export interface FederatedServiceInterface {
  exists(provider:string, federatedRef: string): Promise<FederatedEntityInterface>;
  create(user: FederatedCreatableInterface): Promise<FederatedEntityInterface>;
}
