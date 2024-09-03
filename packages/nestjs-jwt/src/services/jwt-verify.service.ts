import { Inject, Injectable } from '@nestjs/common';
import { JwtVerifyServiceInterface } from '../interfaces/jwt-verify-service.interface';
import { JwtServiceInterface } from '../interfaces/jwt-service.interface';
import {
  JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
  JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
} from '../jwt.constants';

@Injectable()
export class JwtVerifyService implements JwtVerifyServiceInterface {
  constructor(
    @Inject(JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN)
    protected readonly jwtAccessService: JwtServiceInterface,
    @Inject(JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN)
    protected readonly jwtRefreshService: JwtServiceInterface,
  ) {}

  async accessToken(
    ...args: Parameters<JwtVerifyServiceInterface['accessToken']>
  ) {
    return this.jwtAccessService.verifyAsync(...args);
  }

  async refreshToken(
    ...args: Parameters<JwtVerifyServiceInterface['refreshToken']>
  ) {
    return this.jwtRefreshService.verifyAsync(...args);
  }
}
