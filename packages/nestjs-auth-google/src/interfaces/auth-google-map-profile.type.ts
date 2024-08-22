import { AuthGoogleProfileInterface } from './auth-google-profile.interface';
import { AuthGoogleSignInterface } from './auth-google-sign.interface';

export type MapProfile = (
  profile: AuthGoogleProfileInterface,
) => AuthGoogleSignInterface;
