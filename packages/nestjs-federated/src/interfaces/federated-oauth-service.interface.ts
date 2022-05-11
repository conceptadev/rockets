import { FederatedCredentialsInterface } from './federated-credentials.interface';

export interface FederatedOAuthServiceInterface {
  // TODO: should provider be a enum?
  // marshall says: maybe providers is an array of allowed strings in settings?
  sign(
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface>;
}
