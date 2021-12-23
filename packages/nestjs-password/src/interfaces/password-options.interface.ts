import { OptionsInterface } from '@rockts-org/nestjs-common';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';

/**
 * Password module configuration options interface
 */
export interface PasswordOptionsInterface extends OptionsInterface {
  /**
   * Min level of password strength allowed
   */
  minPasswordStrength?: PasswordStrengthEnum;

  /**
   * Max number of password attempts allowed
   */
  maxPasswordAttempts?: number;
}
