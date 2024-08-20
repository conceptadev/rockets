import { AuthenticationCodeInterface } from '@concepta/ts-common';
import { Type } from '@nestjs/common';
import { AuthGithubProfileInterface } from './auth-github-profile.interface';
import { AuthGithubSignInterface } from './auth-github-sign.interface';

export interface AuthGithubSettingsInterface {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  loginDto?: Type<AuthenticationCodeInterface>;
  profileFormatter: (
    profile: AuthGithubProfileInterface,
  ) => AuthGithubSignInterface;
}
