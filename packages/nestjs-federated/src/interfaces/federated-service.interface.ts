import { FederatedEntityInterface } from '@concepta/nestjs-common';

export interface FederatedServiceInterface {
  exists(
    provider: string,
    federatedRef: string,
  ): Promise<FederatedEntityInterface | null>;
}
