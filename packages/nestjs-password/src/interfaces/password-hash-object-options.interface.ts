import { PasswordSaltOptionInterface } from './password-salt-option.interface';

export interface PasswordHashObjectOptionsInterface
  extends PasswordSaltOptionInterface {
  /**
   * Set to true if password is required.
   */
  required?: boolean;
}
