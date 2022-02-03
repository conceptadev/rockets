import { JwtService } from '@nestjs/jwt';

export interface JwtIssueServiceInterface {
  accessToken(
    ...args: Parameters<JwtService['signAsync']>
  ): ReturnType<JwtService['signAsync']>;

  refreshToken(
    ...args: Parameters<JwtService['signAsync']>
  ): ReturnType<JwtService['signAsync']>;
}
