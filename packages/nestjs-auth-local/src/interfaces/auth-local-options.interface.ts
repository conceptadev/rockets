import {
  CredentialLookupInterface,
  UserLookupServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';

import { OptionsInterface } from '@rockts-org/nestjs-common';
import { AuthLocalSettingsInterface } from './auth-local-settings.interface';

export interface AuthLocalOptionsInterface extends OptionsInterface {
  /**
   * Implementation of a class that returns CredentialLookupInterface
   */
  userLookupService?: UserLookupServiceInterface<CredentialLookupInterface>;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  settings?: AuthLocalSettingsInterface;
}
