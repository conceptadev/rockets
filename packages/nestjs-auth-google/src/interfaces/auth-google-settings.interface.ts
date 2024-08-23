import { StrategyOptions } from 'passport-google-oauth20';
import { Type } from '@nestjs/common';
import { AuthenticationCodeInterface } from '@concepta/ts-common';
import { MapProfile } from '../auth-google.types';

export interface AuthGoogleSettingsInterface extends StrategyOptions {
  loginDto?: Type<AuthenticationCodeInterface>;
  mapProfile: MapProfile;
}
