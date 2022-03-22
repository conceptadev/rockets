import {
  IssueTokenServiceInterface,
  UserLookupServiceInterface,
  VerifyTokenService,
} from '@concepta/nestjs-authentication';
import { OptionsInterface } from '@concepta/nestjs-common';
import { AuthRefreshSettingsInterface } from './auth-refresh-settings.interface';

export interface AuthRefreshOptionsInterface extends OptionsInterface {
  /**
   * Implementation of a class that returns user identity
   */
  userLookupService?: UserLookupServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Implementation of a class to verify tokens
   */
  verifyTokenService?: VerifyTokenService;

  /**
   * Settings
   */
  settings?: AuthRefreshSettingsInterface;
}
