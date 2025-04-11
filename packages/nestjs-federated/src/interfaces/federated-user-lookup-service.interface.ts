import {
  ByEmailInterface,
  ByIdInterface,
  ReferenceEmail,
  ReferenceId,
} from '@concepta/nestjs-common';
import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedUserLookupServiceInterface
  extends ByIdInterface<ReferenceId, FederatedCredentialsInterface>,
    ByEmailInterface<ReferenceEmail, FederatedCredentialsInterface> {}
