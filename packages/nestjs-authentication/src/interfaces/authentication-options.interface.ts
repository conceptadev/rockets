import { OptionsInterface } from '@rockts-org/nestjs-common';
import { IssueTokenServiceInterface } from './issue-token-service.interface';
import { AuthenticationSettingsInterface } from './authentication-settings.interface';
import { VerifyTokenServiceInterface } from './verify-token-service.interface';
import { ValidateTokenServiceInterface } from './validate-token-service.interface';
import { UserLookupServiceInterface } from '../interfaces/user-lookup-service.interface';

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface extends OptionsInterface {
  settings?: AuthenticationSettingsInterface;
  issueTokenService?: IssueTokenServiceInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
  validateTokenService?: ValidateTokenServiceInterface;
  userLookupService?: UserLookupServiceInterface;
}
