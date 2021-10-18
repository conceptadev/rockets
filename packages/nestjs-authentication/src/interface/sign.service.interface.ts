/**
 * Password Strength Service Interface
 */
export interface SignServiceInterface {
    /**
     * Check if password matches 
     * @param passwordPlain 
     * @param passwordCrypt 
     * @param salt 
     * @returns 
     */
    authenticate(passwordPlain: string, passwordCrypt: string, salt: string): Promise<boolean>;
    /**
     * Get the access token
     * @param username email or username
     * @param password user password
     * @returns 
     */
    retrieveAccessToken(username: string, password: string): boolean;
    /**
     * Refresh access token to increase the expiration date
     * @param username email or username
     * @param password user password
     * @returns 
     */
    refreshAccessToken(username: string, password: string): boolean;
}
