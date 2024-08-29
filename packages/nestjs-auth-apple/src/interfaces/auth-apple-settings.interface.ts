import { AuthenticationCodeInterface } from '@concepta/ts-common';
import { Type } from '@nestjs/common';
import { AuthenticateOptions } from 'passport-apple';

export interface AuthAppleSettingsInterface extends AuthenticateOptions {
  loginDto?: Type<AuthenticationCodeInterface>;
}
