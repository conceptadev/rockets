import { IdentityInterface } from '@concepta/nestjs-common';

export interface AuthJwtUserLookupServiceInterface {
  getById(username: IdentityInterface['id']): Promise<IdentityInterface>;
}
