import { JwtSignServiceInterface } from './jwt-sign-service.interface';

export interface JwtIssueServiceInterface {
  accessToken<T extends JwtSignServiceInterface['signAsync']>(
    payload: T,
  ): Promise<string>;

  refreshToken<T extends JwtSignServiceInterface['signAsync']>(
    payload: T,
  ): Promise<string>;
}
