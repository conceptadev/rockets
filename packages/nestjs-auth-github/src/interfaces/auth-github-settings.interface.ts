import { AuthenticationCodeInterface } from '@concepta/ts-common';
import { Type } from '@nestjs/common';

export interface AuthGithubSettingsInterface {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  loginDto?: Type<AuthenticationCodeInterface>;
}
