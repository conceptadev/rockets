import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';
import { AuthAppleSettingsInterface } from './auth-apple-settings.interface';
import { AuthAppleServiceInterface } from './auth-apple-service.interface';

export interface AuthAppleOptionsInterface
  extends ModuleOptionsSettingsInterface<AuthAppleSettingsInterface> {
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  // TODO: find a better name for this?
  authAppleService?: AuthAppleServiceInterface;

  /**
   * Settings
   */
  settings?: AuthAppleSettingsInterface;
}
