/**
 * Password Strength Service Interface
 */
export interface PasswordStrengthServiceInterface {
    /**
     * Check if Password is strong
     * @param password 
     */
    isStrong(password: string): boolean;
}
