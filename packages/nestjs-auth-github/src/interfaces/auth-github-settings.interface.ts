import { OptionsInterface } from '@concepta/ts-core';

export interface AuthGithubSettingsInterface extends OptionsInterface {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
}
