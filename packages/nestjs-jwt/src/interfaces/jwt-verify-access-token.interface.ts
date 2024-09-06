import { NestJwtService } from '../jwt.externals';

export interface JwtVerifyAccessTokenInterface {
  accessToken(
    ...args: Parameters<NestJwtService['verifyAsync']>
  ): ReturnType<NestJwtService['verifyAsync']>;
}
