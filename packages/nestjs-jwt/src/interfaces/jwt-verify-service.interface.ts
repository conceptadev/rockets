import { JwtService } from '@nestjs/jwt';

export interface JwtVerifyServiceInterface {
  accessToken(
    ...args: Parameters<JwtService['verifyAsync']>
  ): ReturnType<JwtService['verifyAsync']>;

  refreshToken(
    ...args: Parameters<JwtService['verifyAsync']>
  ): ReturnType<JwtService['verifyAsync']>;
}
