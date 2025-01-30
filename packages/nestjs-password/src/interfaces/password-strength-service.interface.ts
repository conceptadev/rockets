import { PasswordStrengthEnum } from '../enum/password-strength.enum';

/**
 * Password Strength Service Interface
 */
export interface PasswordStrengthServiceInterface {
  /**
   * Check if Password is strong
   *
   * @param password - The plain text password
   */
  isStrong(password: string, passwordStrength?: PasswordStrengthEnum): boolean;
}
