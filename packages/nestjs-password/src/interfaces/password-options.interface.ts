import {
  OptionsAsyncInterface,
  OptionsInterface,
} from '@rockts-org/nestjs-common';
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

/**
 * Password async module configuration options interface
 */
export interface PasswordAsyncOptionsInterface
  extends PasswordOptionsInterface,
    OptionsAsyncInterface<PasswordOptionsInterface> {}
