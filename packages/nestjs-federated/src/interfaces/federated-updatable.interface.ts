import { FederatedInterface } from './federated.interface';

export interface FederatedUpdatableInterface
  extends Pick<FederatedInterface, 'provider' | 'subject'> {}
