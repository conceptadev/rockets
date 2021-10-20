import { PasswordStrengthEnum } from "../enum/password-strength.enum";

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationConfigOptionsInterface {
    minPasswordStrength: PasswordStrengthEnum,
    maxPasswordAttempts: number
}
