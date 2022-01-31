import {
  CredentialLookupInterface,
  IssueTokenServiceInterface,
  UserLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { OptionsInterface } from '@rockts-org/nestjs-common';
import { AuthRefreshSettingsInterface } from './auth-refresh-settings.interface';

export interface AuthRefreshOptionsInterface extends OptionsInterface {
  /**
   * Implementation of a class that returns CredentialLookupInterface
   */
  userLookupService?: UserLookupServiceInterface<CredentialLookupInterface>;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  settings?: AuthRefreshSettingsInterface;
}
