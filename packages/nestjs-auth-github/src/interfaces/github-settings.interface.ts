import { OptionsInterface } from '@concepta/nestjs-common';

export interface GithubSettingsInterface extends OptionsInterface {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
}
