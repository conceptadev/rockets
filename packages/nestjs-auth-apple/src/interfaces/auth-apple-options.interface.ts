import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';
import { AuthAppleSettingsInterface } from './auth-apple-settings.interface';

export interface AuthAppleOptionsInterface
  extends ModuleOptionsSettingsInterface<AuthAppleSettingsInterface> {
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Settings
   */
  settings?: AuthAppleSettingsInterface;
}
