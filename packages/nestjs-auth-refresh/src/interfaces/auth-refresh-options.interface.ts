import {
  IssueTokenServiceInterface,
  VerifyTokenService,
} from '@concepta/nestjs-authentication';
import { AuthRefreshUserModelServiceInterface } from './auth-refresh-user-model-service.interface';
import { AuthRefreshSettingsInterface } from './auth-refresh-settings.interface';

export interface AuthRefreshOptionsInterface {
  /**
   * Implementation of a class that returns user identity
   */
  userModelService: AuthRefreshUserModelServiceInterface;

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
