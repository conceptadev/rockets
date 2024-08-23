import { AuthGoogleProfileInterface } from './interfaces/auth-google-profile.interface';
import { AuthGoogleSignInterface } from './interfaces/auth-google-credentials.interface';

export type MapProfile = (
  profile: AuthGoogleProfileInterface,
) => AuthGoogleSignInterface;
