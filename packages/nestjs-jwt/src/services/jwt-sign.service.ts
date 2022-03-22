import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtSignServiceInterface } from '../interfaces/jwt-sign-service.interface';
import {
  JWT_MODULE_JWT_SERVICE_ACCESS_TOKEN,
  JWT_MODULE_JWT_SERVICE_REFRESH_TOKEN,
} from '../jwt.constants';
import { JwtTokenType } from '../jwt.types';

@Injectable()
export class JwtSignService implements JwtSignServiceInterface {
  constructor(
    @Inject(JWT_MODULE_JWT_SERVICE_ACCESS_TOKEN)
    private jwtAccessService: JwtService,
    @Inject(JWT_MODULE_JWT_SERVICE_REFRESH_TOKEN)
    private jwtRefreshService: JwtService,
  ) {}

  async signAsync(
    tokenType: JwtTokenType,
    ...rest: Parameters<JwtService['signAsync']>
  ) {
    return this.service(tokenType).signAsync(...rest);
  }

  async verifyAsync(
    tokenType: JwtTokenType,
    ...rest: Parameters<JwtService['verifyAsync']>
  ) {
    return this.service(tokenType).verifyAsync(...rest);
  }

  decode(tokenType: JwtTokenType, ...rest: Parameters<JwtService['decode']>) {
    return this.service(tokenType).decode(...rest);
  }

  private service(tokenType: JwtTokenType): JwtService {
    switch (tokenType) {
      case 'access':
        return this.jwtAccessService;
      case 'refresh':
        return this.jwtRefreshService;
    }
  }
}
