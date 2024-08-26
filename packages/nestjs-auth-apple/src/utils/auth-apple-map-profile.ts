import { AuthAppleProfileInterface } from '../interfaces/auth-apple-profile.interface';
import { AuthAppleCredentialsInterface as AuthAppleCredentialsInterface } from '../interfaces/auth-apple-credentials.interface';

export const mapProfile = (
  profile: AuthAppleProfileInterface,
): AuthAppleCredentialsInterface => {
  let email = '';

  if (profile.email) {
    email = profile.email;
  } else if (profile.emails && profile.emails.length > 0) {
    email = profile.emails[0].value;
  }

  const result: AuthAppleCredentialsInterface = {
    id: profile?.id ?? '',
    email,
  };
  return result;
};
