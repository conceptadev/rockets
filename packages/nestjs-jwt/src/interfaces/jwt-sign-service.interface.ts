import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtTokenType } from '../jwt.types';

export interface JwtSignServiceInterface {
  signAsync: (
    tokenType: JwtTokenType,
    ...rest: Parameters<NestJwtService['signAsync']>
  ) => ReturnType<NestJwtService['signAsync']>;

  verifyAsync: (
    tokenType: JwtTokenType,
    ...rest: Parameters<NestJwtService['verifyAsync']>
  ) => ReturnType<NestJwtService['verifyAsync']>;

  decode: (
    tokenType: JwtTokenType,
    ...rest: Parameters<NestJwtService['decode']>
  ) => ReturnType<NestJwtService['decode']>;
}
