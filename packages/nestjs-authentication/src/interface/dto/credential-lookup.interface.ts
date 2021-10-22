import { AccessTokenInterface } from "./access-token.interface";
import { PasswordStorageInterface } from "./password-storage.interface";
import { SignDTOInterface } from "./signin.dto.interface"

/**
 * Credential Lookup Interface
 */
export interface CredentialLookupInterface
    extends Partial<Pick<SignDTOInterface, 'username' | 'password'>>,
    Partial<Pick<PasswordStorageInterface, 'salt'>>,
    Partial<Pick<AccessTokenInterface, 'accessToken' | 'expireIn' >>{
    
}
