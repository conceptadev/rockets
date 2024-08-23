import { AuthGoogleProfileInterface } from './interfaces/auth-google-profile.interface';
import { AuthGoogleCredentialsInterface } from './interfaces/auth-google-credentials.interface';

export type MapProfile = (
  profile: AuthGoogleProfileInterface,
) => AuthGoogleCredentialsInterface;
