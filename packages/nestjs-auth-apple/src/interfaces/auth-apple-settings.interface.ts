import { AuthenticateOptions } from 'passport-apple';
import { Type } from '@nestjs/common';
import { AuthenticationCodeInterface } from '@concepta/nestjs-common';
import { MapProfile } from '../auth-apple.types';

export interface AuthAppleSettingsInterface extends AuthenticateOptions {
  loginDto?: Type<AuthenticationCodeInterface>;
  mapProfile: MapProfile;
}
