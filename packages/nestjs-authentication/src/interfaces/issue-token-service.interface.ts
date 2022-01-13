import { AccessTokenInterface } from './access-token.interface';

export interface IssueTokenServiceInterface<
  T extends Record<string, unknown> = AccessTokenInterface,
> {
  accessToken(username: string): Promise<T>;
}
