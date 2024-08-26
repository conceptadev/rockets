import { AuthenticationCodeInterface } from '@concepta/ts-common';
import { Type } from '@nestjs/common';
import { MapProfile } from '../auth-apple.types';
import { AuthenticateOptions } from 'passport-apple';

export interface AuthAppleSettingsInterface extends AuthenticateOptions {
  loginDto?: Type<AuthenticationCodeInterface>;
  mapProfile: MapProfile;
}
