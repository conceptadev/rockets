import { NestJwtService } from '../jwt.externals';

export interface JwtVerifyRefreshTokenInterface {
  refreshToken(
    ...args: Parameters<NestJwtService['verifyAsync']>
  ): ReturnType<NestJwtService['verifyAsync']>;
}
