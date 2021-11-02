import { PasswordStrengthEnum } from '../enum/password-strength.enum';

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationConfigOptionsInterface {
  /**
   * Min level of password strength allowed
   */
  minPasswordStrength: PasswordStrengthEnum;

  /**
   * Max number of password attempts allowed
   */
  maxPasswordAttempts: number;
}
