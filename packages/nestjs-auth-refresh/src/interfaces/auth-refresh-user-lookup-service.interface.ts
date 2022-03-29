import { IdentityInterface } from '@concepta/nestjs-common';

export interface AuthRefreshUserLookupServiceInterface {
  getById(username: IdentityInterface['id']): Promise<IdentityInterface>;
}
