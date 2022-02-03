import {
  CredentialLookupInterface,
  UserLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';

export interface AuthLocalUserLookupServiceInterface
  extends UserLookupServiceInterface<CredentialLookupInterface> {}
