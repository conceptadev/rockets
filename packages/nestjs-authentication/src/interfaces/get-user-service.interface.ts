import { CredentialLookupInterface } from './credential-lookup.interface';

export interface GetUserServiceInterface {
  getUser(username: string): Promise<CredentialLookupInterface>;
  getGithubProfileId(profileId: string): Promise<CredentialLookupInterface>;
}
