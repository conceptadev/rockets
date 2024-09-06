import { AuthAppleCredentialsInterface } from './interfaces/auth-apple-credentials.interface';
import { AuthAppleProfileInterface } from './interfaces/auth-apple-profile.interface';

export type MapProfile = (
  profile: AuthAppleProfileInterface,
) => AuthAppleCredentialsInterface;
