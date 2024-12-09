import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
  ReferenceId,
} from '@concepta/nestjs-common';
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
