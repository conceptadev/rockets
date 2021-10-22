import { AccessTokenInterface } from "../dto/access-token.interface";
import { CredentialLookupInterface } from "../dto/credential-lookup.interface";

/**
 * Sign Service Interface
 */
export abstract class CredentialLookupServiceInterface {
    
    abstract getUser(username: string): Promise<CredentialLookupInterface>;
    
    abstract getAccessToken(username: string): Promise<AccessTokenInterface>;
    
    abstract refreshToken(accessToken: string):  Promise<AccessTokenInterface>;
}
