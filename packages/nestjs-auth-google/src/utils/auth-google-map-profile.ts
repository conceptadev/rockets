import { AuthGoogleProfileInterface } from '../interfaces/auth-google-profile.interface';
import { AuthGoogleSignInterface } from '../interfaces/auth-google-sign.interface';

export const mapProfile = (
  profile: AuthGoogleProfileInterface,
): AuthGoogleSignInterface => {
  let email = '';

  if (profile.email) {
    email = profile.email;
  } else if (profile.emails && profile.emails.length > 0) {
    email = profile.emails[0].value;
  }

  const result: AuthGoogleSignInterface = {
    id: profile?.id || '',
    email,
  };
  return result;
};
