/**
 * Password Strength Service Interface
 */
export interface PasswordStrengthServiceInterface {
    isStrong(password: string): boolean;
}
