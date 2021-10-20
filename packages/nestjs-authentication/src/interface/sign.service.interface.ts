import { SignDTOInterface } from "./signin.dto.interface";

/**
 * Sign Service Interface
 */
export interface SignServiceInterface {
    /**
     * Check if password matches 
     * @param signInDTO 
     * @returns 
     */
    authenticate(signInDTO: SignDTOInterface): Promise<boolean>;
    /**
     * Get the access token
     * @param signInDTO 
     * @returns 
     */
    retrieveAccessToken(signInDTO: SignDTOInterface):  Promise<string>;
    /**
     * Refresh access token to increase the expiration date
     * @param signInDTO 
     * @returns 
     */
    
    refreshAccessToken(signInDTO: SignDTOInterface):  Promise<string>;
}
