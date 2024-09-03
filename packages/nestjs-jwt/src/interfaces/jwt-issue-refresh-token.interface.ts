import { JwtSignOptions, JwtSignStringOptions } from '../jwt.types';

export interface JwtIssueRefreshTokenInterface {
  refreshToken(
    payload: string,
    options?: JwtSignStringOptions,
  ): Promise<string>;

  refreshToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;
}
