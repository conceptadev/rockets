import { AuthAppleProfileInterface } from './interfaces/auth-apple-profile.interface';
import { AuthAppleCredentialsInterface } from './interfaces/auth-apple-credentials.interface';

export type MapProfile = (
  profile: AuthAppleProfileInterface,
) => AuthAppleCredentialsInterface;
