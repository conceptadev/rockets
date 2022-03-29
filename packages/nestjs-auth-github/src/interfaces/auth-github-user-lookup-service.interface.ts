import { IdentityInterface } from '@concepta/nestjs-common';

export interface AuthGithubUserLookupServiceInterface {
  getById(username: IdentityInterface['id']): Promise<IdentityInterface>;
}
