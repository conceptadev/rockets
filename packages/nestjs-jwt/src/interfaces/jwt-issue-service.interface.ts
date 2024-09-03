import { JwtIssueAccessTokenInterface } from './jwt-issue-access-token.interface';
import { JwtIssueRefreshTokenInterface } from './jwt-issue-refresh-token.interface';

export interface JwtIssueServiceInterface
  extends JwtIssueAccessTokenInterface,
    JwtIssueRefreshTokenInterface {}
