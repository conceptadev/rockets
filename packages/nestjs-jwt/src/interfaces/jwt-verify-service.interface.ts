import { NestJwtService } from '../jwt.externals';

export interface JwtVerifyServiceInterface {
  accessToken(
    ...args: Parameters<NestJwtService['verifyAsync']>
  ): ReturnType<NestJwtService['verifyAsync']>;

  refreshToken(
    ...args: Parameters<NestJwtService['verifyAsync']>
  ): ReturnType<NestJwtService['verifyAsync']>;
}
