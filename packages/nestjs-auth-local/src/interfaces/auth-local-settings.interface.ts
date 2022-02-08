import { Type } from '@nestjs/common';
import { OptionsInterface } from '@rockts-org/nestjs-common';

export interface AuthLocalSettingsInterface extends OptionsInterface {
  loginDto?: Type;
  usernameField?: string;
  passwordField?: string;
}