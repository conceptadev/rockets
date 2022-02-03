import { Injectable } from '@nestjs/common';
import { JwtVerifyServiceInterface } from '../interfaces/jwt-verify-service.interface';
import { JwtSignService } from './jwt-sign.service';

@Injectable()
export class JwtVerifyService implements JwtVerifyServiceInterface {
  constructor(private jwtSignService: JwtSignService) {}

  async accessToken(
    ...args: Parameters<JwtVerifyServiceInterface['accessToken']>
  ) {
    return this.jwtSignService.verifyAsync('access', ...args);
  }

  async refreshToken(
    ...args: Parameters<JwtVerifyServiceInterface['refreshToken']>
  ) {
    return this.jwtSignService.verifyAsync('refresh', ...args);
  }
}
