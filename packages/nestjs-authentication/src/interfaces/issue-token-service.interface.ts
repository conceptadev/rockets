import { AuthenticationResponseInterface } from '../interfaces/authentication-response.interface';

export interface IssueTokenServiceInterface {
  accessToken(id: string): Promise<string>;
  refreshToken(id: string): Promise<string>;
  responsePayload(id: string): Promise<AuthenticationResponseInterface>;
}
