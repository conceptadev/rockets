import { AccessTokenInterface } from './access-token.interface';

export interface IssueTokenServiceInterface {
  issueAccessToken(username: string): Promise<AccessTokenInterface>;
}