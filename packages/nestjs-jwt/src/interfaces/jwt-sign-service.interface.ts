import { NestJwtService } from '../jwt.externals';
import {
  JwtSignOptions,
  JwtSignStringOptions,
  JwtTokenType,
} from '../jwt.types';

export interface JwtSignServiceInterface {
  signAsync(
    tokenType: JwtTokenType,
    payload: string,
    options?: JwtSignStringOptions,
  ): Promise<string>;

  signAsync(
    tokenType: JwtTokenType,
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  verifyAsync: (
    tokenType: JwtTokenType,
    ...rest: Parameters<NestJwtService['verifyAsync']>
  ) => ReturnType<NestJwtService['verifyAsync']>;

  decode: (
    tokenType: JwtTokenType,
    ...rest: Parameters<NestJwtService['decode']>
  ) => ReturnType<NestJwtService['decode']>;
}
