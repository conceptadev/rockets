import { JwtService } from '@nestjs/jwt';
import { JwtSignServiceInterface } from './jwt-sign-service.interface';
import { JwtIssueServiceInterface } from './jwt-issue-service.interface';
import { JwtSettingsInterface } from './jwt-settings.interface';
import { JwtVerifyServiceInterface } from './jwt-verify-service.interface';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface {
  jwtAccessService?: JwtService;
  jwtRefreshService?: JwtService;
  jwtSignService?: JwtSignServiceInterface;
  jwtIssueService?: JwtIssueServiceInterface;
  jwtVerifyService?: JwtVerifyServiceInterface;
  settings?: JwtSettingsInterface;
}
