import { AccessTokenInterface } from "../dto/access-token.interface";
import { SignDTOInterface } from "../dto/signin.dto.interface";

/**
 * Sign Service Interface
 */
export interface SignServiceInterface {
    /**
     * Check if password matches 
     * @param signInDTO 
     * @returns 
     */
    authenticate(signInDTO: SignDTOInterface): Promise<AccessTokenInterface>;
    /**
     * Get the access token
     * @param signInDTO 
     * @returns 
     */
    retrieveAccessToken(signInDTO: SignDTOInterface):  Promise<AccessTokenInterface>;
    /**
     * Refresh access token to increase the expiration date
     * @param signInDTO 
     * @returns 
     */
    
    refreshAccessToken(signInDTO: SignDTOInterface):  Promise<AccessTokenInterface>;
}
