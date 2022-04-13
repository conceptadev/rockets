import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedOAuthServiceInterface {
  // TODO: should provider be a enum?
  sign(
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface>;
}
