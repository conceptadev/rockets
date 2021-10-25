/**
 * Interface for access token
 */
export interface AccessTokenInterface {
    
    /**
     * Access token
     */
    accessToken: string,

    /**
     * Expiration date for access token
     */
    expireIn: Date
}
