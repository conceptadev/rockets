import { JwtServiceInterface } from './jwt-service.interface';
import { JwtIssueTokenServiceInterface } from './jwt-issue-token-service.interface';
import { JwtSettingsInterface } from './jwt-settings.interface';
import { JwtVerifyTokenServiceInterface } from './jwt-verify-token-service.interface';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface {
  jwtService?: JwtServiceInterface;
  jwtAccessService?: JwtServiceInterface;
  jwtRefreshService?: JwtServiceInterface;
  jwtIssueTokenService?: JwtIssueTokenServiceInterface;
  jwtVerifyTokenService?: JwtVerifyTokenServiceInterface;
  settings?: JwtSettingsInterface;
}
