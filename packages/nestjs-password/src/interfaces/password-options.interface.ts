import { OptionsInterface } from '@concepta/ts-core';
import { PasswordSettingsInterface } from './password-settings.interface';

/**
 * Password module configuration options interface
 */
export interface PasswordOptionsInterface extends OptionsInterface {
  settings?: PasswordSettingsInterface;
}
