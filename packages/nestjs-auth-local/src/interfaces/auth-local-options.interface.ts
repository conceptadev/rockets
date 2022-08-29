import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { AuthLocalSettingsInterface } from './auth-local-settings.interface';
import { AuthLocalUserLookupServiceInterface } from './auth-local-user-lookup-service.interface';

export interface AuthLocalOptionsInterface {
  /**
   * Implementation of a class to lookup users
   */
  userLookupService: AuthLocalUserLookupServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Settings
   */
  settings?: AuthLocalSettingsInterface;
}
