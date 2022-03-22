import {
  CredentialLookupInterface,
  UserLookupServiceInterface,
} from '@concepta/nestjs-authentication';

export interface AuthLocalUserLookupServiceInterface
  extends UserLookupServiceInterface<CredentialLookupInterface> {}
