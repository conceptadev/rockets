import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
} from '@concepta/nestjs-common';
import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedUserLookupServiceInterface
  extends LookupIdInterface<ReferenceEmail, FederatedCredentialsInterface>,
    LookupEmailInterface<ReferenceEmail, FederatedCredentialsInterface> {}
