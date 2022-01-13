import { OptionsInterface } from '@rockts-org/nestjs-common';
import { JwtSignServiceInterface } from './jwt-sign-service.interface';
import { JwtIssueServiceInterface } from './jwt-issue-service.interface';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface extends OptionsInterface {
  jwtSignService?: JwtSignServiceInterface;
  jwtIssueService?: JwtIssueServiceInterface;
}
