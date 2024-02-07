import { PasswordStrengthEnum } from '../enum/password-strength.enum';

/**
 * Password module settings interface
 */
export interface PasswordSettingsInterface {
  /**
   * Min level of password strength allowed
   */
  minPasswordStrength?: PasswordStrengthEnum;

  /**
   * Max number of password attempts allowed
   */
  maxPasswordAttempts?: number;

  /**
   * Require current password to update
   */
  requireCurrentToUpdate?: boolean;
}
