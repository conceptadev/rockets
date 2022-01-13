import { OptionsInterface } from '@rockts-org/nestjs-common';
import { IssueTokenServiceInterface } from '@rockts-org/nestjs-authentication';
import { JwtSignServiceInterface } from './jwt-sign-service.interface';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface extends OptionsInterface {
  jwtSignService?: JwtSignServiceInterface;
  jwtIssueService?: IssueTokenServiceInterface;
}
