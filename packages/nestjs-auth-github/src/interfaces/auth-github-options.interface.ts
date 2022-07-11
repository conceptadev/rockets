import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import {
  ModuleOptionsControllerInterface,
  ModuleOptionsSettingsInterface,
} from '@concepta/nestjs-core';
import { AuthGithubSettingsInterface } from './auth-github-settings.interface';

export interface AuthGithubOptionsInterface
  extends ModuleOptionsSettingsInterface<AuthGithubSettingsInterface>,
    ModuleOptionsControllerInterface {
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Settings
   */
  settings?: AuthGithubSettingsInterface;
}
