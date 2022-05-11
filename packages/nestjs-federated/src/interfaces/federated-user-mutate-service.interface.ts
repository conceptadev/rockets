import { CreateOneInterface } from '@concepta/nestjs-common';

import { FederatedCredentialsInterface } from './federated-credentials.interface';
import { FederatedUserMutateInterface } from './federated-user-mutate.interface';

export interface FederatedUserMutateServiceInterface
  extends CreateOneInterface<
    FederatedUserMutateInterface,
    FederatedCredentialsInterface
  > {}
