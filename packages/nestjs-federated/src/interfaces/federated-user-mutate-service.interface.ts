import { CreateOneInterface } from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

import { FederatedCredentialsInterface } from './federated-credentials.interface';
import { FederatedUserMutateInterface } from './federated-user-mutate.interface';

export interface FederatedUserMutateServiceInterface
  extends CreateOneInterface<
    FederatedUserMutateInterface,
    FederatedCredentialsInterface,
    QueryOptionsInterface
  > {}
