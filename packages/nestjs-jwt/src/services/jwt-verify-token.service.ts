import { Inject, Injectable } from '@nestjs/common';
import { JwtVerifyTokenServiceInterface } from '../interfaces/jwt-verify-token-service.interface';
import { JwtVerifyServiceInterface } from '../interfaces/jwt-verify-service.interface';
import { JwtAccessService, JwtRefreshService } from '../jwt.constants';

@Injectable()
export class JwtVerifyTokenService implements JwtVerifyTokenServiceInterface {
  constructor(
    @Inject(JwtAccessService)
    protected readonly jwtAccessService: JwtVerifyServiceInterface,
    @Inject(JwtRefreshService)
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
