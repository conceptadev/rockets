import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
  ReferenceId,
} from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedUserLookupServiceInterface
  extends LookupIdInterface<
      ReferenceId,
      FederatedCredentialsInterface,
      QueryOptionsInterface
    >,
    LookupEmailInterface<
      ReferenceEmail,
      FederatedCredentialsInterface,
      QueryOptionsInterface
    > {}
