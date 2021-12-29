import { OptionsInterface } from '@rockts-org/nestjs-common';
import { AuthenticationSettingsInterface } from './authentication-settings.interface';

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface extends OptionsInterface {
  settings?: AuthenticationSettingsInterface;
}
