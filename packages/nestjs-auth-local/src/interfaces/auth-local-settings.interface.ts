import { Type } from '@nestjs/common';
import { OptionsInterface } from '@concepta/ts-core';

export interface AuthLocalSettingsInterface extends OptionsInterface {
  loginDto?: Type;
  usernameField?: string;
  passwordField?: string;
}
