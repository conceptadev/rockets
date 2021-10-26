import { AccessTokenInterface } from "./access-token.interface";
import { CredentialLookupInterface } from "./credential-lookup.interface";

/**
 * Credential Lookup Interface
 */
export interface AuthenticationResponseInterface
    extends Partial<Pick<CredentialLookupInterface,'id' | 'username'>>,
        Partial<Pick<AccessTokenInterface, 'accessToken' | 'expireIn'>>{ }
