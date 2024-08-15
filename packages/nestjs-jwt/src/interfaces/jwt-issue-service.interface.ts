import { JwtSignOptions, JwtSignStringOptions } from '../jwt.types';

export interface JwtIssueServiceInterface {
  accessToken(payload: string, options?: JwtSignStringOptions): Promise<string>;

  accessToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  refreshToken(
    payload: string,
    options?: JwtSignStringOptions,
  ): Promise<string>;

  refreshToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;
}
