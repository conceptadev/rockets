import {
  ByEmailInterface,
  ByIdInterface,
  CreateOneInterface,
  ReferenceEmail,
  ReferenceEmailInterface,
  ReferenceId,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';
import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedUserModelServiceInterface
  extends ByIdInterface<ReferenceId, FederatedCredentialsInterface>,
    ByEmailInterface<ReferenceEmail, FederatedCredentialsInterface>,
    CreateOneInterface<
      ReferenceEmailInterface & ReferenceUsernameInterface,
      FederatedCredentialsInterface
    > {}
