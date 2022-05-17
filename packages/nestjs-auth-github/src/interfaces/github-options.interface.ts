import { OptionsInterface } from '@concepta/ts-core';
import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';
import { GithubSettingsInterface } from './github-settings.interface';

export interface GithubOptionsInterface
  extends OptionsInterface,
    ModuleOptionsSettingsInterface {
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Settings
   */
  settings?: GithubSettingsInterface;
}
