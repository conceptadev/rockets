import { AuthenticationCodeInterface } from '@concepta/ts-common';
import { Type } from '@nestjs/common';
import { MapProfile } from './auth-google-map-profile.type';
import { StrategyOptions } from 'passport-google-oauth20';

export interface AuthGoogleSettingsInterface extends StrategyOptions {
  loginDto?: Type<AuthenticationCodeInterface>;
  mapProfile: MapProfile;
}
