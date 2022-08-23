import { IssueTokenServiceInterface } from './issue-token-service.interface';
import { AuthenticationSettingsInterface } from './authentication-settings.interface';
import { VerifyTokenServiceInterface } from './verify-token-service.interface';
import { ValidateTokenServiceInterface } from './validate-token-service.interface';

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface {
  // TODO: move global to extras
  global?: boolean;
  settings?: AuthenticationSettingsInterface;
  issueTokenService?: IssueTokenServiceInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
  validateTokenService?: ValidateTokenServiceInterface;
}
