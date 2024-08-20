import { AuthGithubProfileInterface } from './auth-github-profile.interface';
import { AuthGithubSignInterface } from './auth-github-sign.interface';

export type MapProfile = (
  profile: AuthGithubProfileInterface,
) => AuthGithubSignInterface;
