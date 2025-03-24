import { JwtSignOptions, JwtSignStringOptions } from "../jwt.types";

export interface JwtSignServiceInterface {
  signAsync(payload: string, options?: JwtSignStringOptions): Promise<string>;

  signAsync(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;
}
