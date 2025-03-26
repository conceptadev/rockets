import { IssueTokenServiceInterface } from '../../core/interfaces/issue-token-service.interface';
import { VerifyTokenService } from '../../jwt/services/verify-token.service';
import { AuthRefreshUserLookupServiceInterface } from './auth-refresh-user-lookup-service.interface';
import { AuthRefreshSettingsInterface } from './auth-refresh-settings.interface';

export interface AuthRefreshOptionsInterface {
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
