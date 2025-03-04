import { PasswordStrengthOptionsInterface } from './password-strength-options.interface';

/**
 * Password Strength Service Interface
 */
export interface PasswordStrengthServiceInterface {
  /**
   * Check if Password is strong
   *
   * @param password - The plain text password
   * @param options - The options
   */
  isStrong(
    password: string,
    options?: PasswordStrengthOptionsInterface,
  ): boolean;
}
