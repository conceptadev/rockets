import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';
import { AuthGithubSettingsInterface } from './auth-github-settings.interface';

export interface AuthGithubOptionsInterface
  extends ModuleOptionsSettingsInterface<AuthGithubSettingsInterface> {
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Settings
   */
  settings?: AuthGithubSettingsInterface;
}
