import { OptionsInterface } from '@rockts-org/nestjs-common';

export interface AuthLocalSettingsInterface extends OptionsInterface {
  usernameField?: string;
  passwordField?: string;
}
