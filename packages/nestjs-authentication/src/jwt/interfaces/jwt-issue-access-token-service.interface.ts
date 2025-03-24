import { JwtSignOptions, JwtSignStringOptions } from "../jwt.types";


export interface JwtIssueAccessTokenServiceInterface {
  accessToken(payload: string, options?: JwtSignStringOptions): Promise<string>;

  accessToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;
}
