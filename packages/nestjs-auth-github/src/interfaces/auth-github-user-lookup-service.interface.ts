import { IdentityInterface } from '@concepta/nestjs-common';

export interface AuthGithubUserLookupServiceInterface {
  getById(id: IdentityInterface['id']): Promise<IdentityInterface>;
}
