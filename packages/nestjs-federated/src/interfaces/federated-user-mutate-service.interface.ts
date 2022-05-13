import { CreateOneInterface } from '@concepta/ts-core';

import { FederatedCredentialsInterface } from './federated-credentials.interface';
import { FederatedUserMutateInterface } from './federated-user-mutate.interface';

export interface FederatedUserMutateServiceInterface
  extends CreateOneInterface<
    FederatedUserMutateInterface,
    FederatedCredentialsInterface
  > {}
