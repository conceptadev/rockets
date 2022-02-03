import { IssueTokenServiceInterface } from '@rockts-org/nestjs-authentication';

import { OptionsInterface } from '@rockts-org/nestjs-common';
import { AuthLocalSettingsInterface } from './auth-local-settings.interface';
import { AuthLocalUserLookupServiceInterface } from './auth-local-user-lookup-service.interface';

export interface AuthLocalOptionsInterface extends OptionsInterface {
  /**
   * Implementation of a class to lookup users
   */
  userLookupService?: AuthLocalUserLookupServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  settings?: AuthLocalSettingsInterface;
}
