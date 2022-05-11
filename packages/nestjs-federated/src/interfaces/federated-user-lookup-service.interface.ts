import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
  ReferenceId,
} from '@concepta/nestjs-common';
import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedUserLookupServiceInterface
  extends LookupIdInterface<ReferenceId, FederatedCredentialsInterface>,
    LookupEmailInterface<ReferenceEmail, FederatedCredentialsInterface> {}
