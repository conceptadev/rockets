import { OptionsInterface } from '@concepta/ts-core';

export interface GithubSettingsInterface extends OptionsInterface {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
}
