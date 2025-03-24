import { Inject, Injectable } from '@nestjs/common';
import { JwtVerifyTokenServiceInterface } from '../interfaces/jwt-verify-token-service.interface';
import { JwtVerifyServiceInterface } from '../interfaces/jwt-verify-service.interface';
import { JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN, JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN } from '../jwt.constants';


@Injectable()
export class JwtVerifyTokenService implements JwtVerifyTokenServiceInterface {
  constructor(
    @Inject(JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN)
    protected readonly jwtAccessService: JwtVerifyServiceInterface,
    @Inject(JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN)
    protected readonly jwtRefreshService: JwtVerifyServiceInterface,
  ) {}

  async accessToken(
    ...args: Parameters<JwtVerifyTokenServiceInterface['accessToken']>
  ) {
    return this.jwtAccessService.verifyAsync(...args);
  }

  async refreshToken(
    ...args: Parameters<JwtVerifyTokenServiceInterface['refreshToken']>
  ) {
    return this.jwtRefreshService.verifyAsync(...args);
  }
}
