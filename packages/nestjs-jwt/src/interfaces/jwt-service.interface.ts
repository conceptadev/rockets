import { NestJwtService } from '../jwt.externals';
import { JwtSignOptions, JwtSignStringOptions } from '../jwt.types';

export interface JwtServiceInterface {
  signAsync(payload: string, options?: JwtSignStringOptions): Promise<string>;

  signAsync(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  verifyAsync: (
    ...rest: Parameters<NestJwtService['verifyAsync']>
  ) => ReturnType<NestJwtService['verifyAsync']>;

  decode: (
    ...rest: Parameters<NestJwtService['decode']>
  ) => ReturnType<NestJwtService['decode']>;
}
