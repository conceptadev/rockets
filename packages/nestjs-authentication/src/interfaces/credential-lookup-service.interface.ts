import { AccessTokenInterface } from './access-token.interface';
import { CredentialLookupInterface } from './credential-lookup.interface';

/**
 * Credential Lookup Service Interface
 */

export interface CredentialLookupServiceInterface {
  getUser(username: string): Promise<CredentialLookupInterface>;

  issueAccessToken(username: string): Promise<AccessTokenInterface>;

  refreshToken(accessToken: string): Promise<AccessTokenInterface>;
}