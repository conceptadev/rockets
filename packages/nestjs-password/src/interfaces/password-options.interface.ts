import { OptionsInterface } from '@rockts-org/nestjs-common';
import { PasswordSettingsInterface } from './password-settings.interface';

/**
 * Password module configuration options interface
 */
export interface PasswordOptionsInterface extends OptionsInterface {
  settings?: PasswordSettingsInterface;
}
