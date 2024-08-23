import { AuthGoogleProfileInterface } from '../interfaces/auth-google-profile.interface';
import { AuthGoogleSignInterface as AuthGoogleCredentialsInterface } from '../interfaces/auth-google-credentials.interface';

export const mapProfile = (
  profile: AuthGoogleProfileInterface,
): AuthGoogleCredentialsInterface => {
  let email = '';

  if (profile.email) {
    email = profile.email;
  } else if (profile.emails && profile.emails.length > 0) {
    email = profile.emails[0].value;
  }

  const result: AuthGoogleCredentialsInterface = {
    id: profile?.id ?? '',
    email,
  };
  return result;
};
