import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
  ReferenceId,
} from '@concepta/ts-core';
import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedUserLookupServiceInterface
  extends LookupIdInterface<ReferenceId, FederatedCredentialsInterface>,
    LookupEmailInterface<ReferenceEmail, FederatedCredentialsInterface> {}
