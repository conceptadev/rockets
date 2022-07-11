import { Type } from '@nestjs/common';

export interface AuthLocalSettingsInterface {
  loginDto?: Type;
  usernameField?: string;
  passwordField?: string;
}
