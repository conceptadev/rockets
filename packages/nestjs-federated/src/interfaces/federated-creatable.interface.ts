import { FederatedEntityInterface } from './federated-entity.interface';

export interface FederatedCreatableInterface
  extends Pick<FederatedEntityInterface, 'provider' | 'subject' | 'userId'> {}
