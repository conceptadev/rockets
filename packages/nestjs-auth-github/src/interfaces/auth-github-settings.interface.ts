import { AuthenticationCodeInterface } from '@concepta/nestjs-common';
import { Type } from '@nestjs/common';
import { MapProfile } from '../auth-github.types';

export interface AuthGithubSettingsInterface {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  loginDto?: Type<AuthenticationCodeInterface>;
  mapProfile: MapProfile;
}
