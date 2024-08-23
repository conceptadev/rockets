import { AuthGithubProfileInterface } from './interfaces/auth-github-profile.interface';
import { AuthGithubCredentialsInterface } from './interfaces/auth-github-credentials.interface';

export type MapProfile = (
  profile: AuthGithubProfileInterface,
) => AuthGithubCredentialsInterface;
