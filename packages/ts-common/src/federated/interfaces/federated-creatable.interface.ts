import { FederatedInterface } from './federated.interface';

export interface FederatedCreatableInterface
  extends Pick<FederatedInterface, 'provider' | 'subject' | 'user'> {}
