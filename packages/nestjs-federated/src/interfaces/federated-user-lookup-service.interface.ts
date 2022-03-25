import {
  CredentialLookupInterface,
  UserLookupServiceInterface,
} from '@concepta/nestjs-authentication';

//TODO: should we use UserLookupServiceInterface instead of FederatedUserLookupServiceInterface?
export interface FederatedUserLookupServiceInterface
  extends UserLookupServiceInterface<CredentialLookupInterface> {
    getUserByEmail(email: string): Promise<CredentialLookupInterface>;
  }
