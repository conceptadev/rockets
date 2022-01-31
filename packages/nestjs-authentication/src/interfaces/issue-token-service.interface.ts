import { AuthenticationResponseInterface } from '../interfaces/authentication-response.interface';

export interface IssueTokenServiceInterface {
  accessToken(payload: string | { [key: string]: unknown }): Promise<string>;
  refreshToken(payload: string | { [key: string]: unknown }): Promise<string>;
  responsePayload(
    payload: string | { [key: string]: unknown },
  ): Promise<AuthenticationResponseInterface>;
}
