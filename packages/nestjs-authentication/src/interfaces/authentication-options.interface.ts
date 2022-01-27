import { OptionsInterface } from '@rockts-org/nestjs-common';
import { IssueTokenServiceInterface } from './issue-token-service.interface';
import { AuthenticationSettingsInterface } from './authentication-settings.interface';
import { DecodeTokenServiceInterface } from './decode-token-service.interface';

/**
 * Authentication module configuration options interface
 */
export interface AuthenticationOptionsInterface extends OptionsInterface {
  settings?: AuthenticationSettingsInterface;
  issueTokenService?: IssueTokenServiceInterface;
  decodeTokenService?: DecodeTokenServiceInterface;
}
