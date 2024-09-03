import { NestJwtService } from '../jwt.externals';
import { JwtServiceInterface } from './jwt-service.interface';
import { JwtIssueServiceInterface } from './jwt-issue-service.interface';
import { JwtSettingsInterface } from './jwt-settings.interface';
import { JwtVerifyServiceInterface } from './jwt-verify-service.interface';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface {
  jwtAccessService?: NestJwtService;
  jwtRefreshService?: NestJwtService;
  jwtService?: JwtServiceInterface;
  jwtIssueService?: JwtIssueServiceInterface;
  jwtVerifyService?: JwtVerifyServiceInterface;
  settings?: JwtSettingsInterface;
}
