import { AccessTokenInterface } from "../dto/access-token.interface";
import { AuthenticationResponseInterface } from "../dto/authentication-response.interface";
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
    authenticate(signInDTO: SignDTOInterface): Promise<AuthenticationResponseInterface>;
     
    /**
     * Refresh access token to increase the expiration date
     * @param accessToken 
     * @returns 
     */
    refreshAccessToken(accessToken: string):  Promise<AccessTokenInterface>;
}
