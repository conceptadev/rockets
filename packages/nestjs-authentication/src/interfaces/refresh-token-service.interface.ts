import { AccessTokenInterface } from './access-token.interface';

export interface RefreshTokenServiceInterface {
  refreshToken(accessToken: string): Promise<AccessTokenInterface>;
}
