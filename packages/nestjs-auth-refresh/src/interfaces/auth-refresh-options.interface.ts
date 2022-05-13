import { OptionsInterface } from '@concepta/ts-core';
import {
  IssueTokenServiceInterface,
  VerifyTokenService,
} from '@concepta/nestjs-authentication';
import { AuthRefreshUserLookupServiceInterface } from './auth-refresh-user-lookup-service.interface';
import { AuthRefreshSettingsInterface } from './auth-refresh-settings.interface';

export interface AuthRefreshOptionsInterface extends OptionsInterface {
  /**
   * Implementation of a class that returns user identity
   */
  userLookupService: AuthRefreshUserLookupServiceInterface;

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
