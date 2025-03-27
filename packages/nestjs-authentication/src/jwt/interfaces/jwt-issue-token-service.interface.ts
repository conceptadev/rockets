import { JwtIssueAccessTokenServiceInterface } from './jwt-issue-access-token-service.interface';
import { JwtIssueRefreshTokenServiceInterface } from './jwt-issue-refresh-token-service.interface';

export interface JwtIssueTokenServiceInterface
  extends JwtIssueAccessTokenServiceInterface,
    JwtIssueRefreshTokenServiceInterface {}
