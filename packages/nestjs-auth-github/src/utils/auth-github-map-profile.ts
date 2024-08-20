import { AuthGithubProfileInterface } from '../interfaces/auth-github-profile.interface';
import { AuthGithubSignInterface } from '../interfaces/auth-github-sign.interface';

export const mapProfile = (
  profile: AuthGithubProfileInterface,
): AuthGithubSignInterface => {
  let email = '';

  if (profile.email) email = profile.email;
  else if (profile.emails && profile.emails.length > 0) {
    email = profile.emails[0].value;
  }

  const result: AuthGithubSignInterface = {
    id: profile?.id || '',
    email,
  };
  return result;
};
