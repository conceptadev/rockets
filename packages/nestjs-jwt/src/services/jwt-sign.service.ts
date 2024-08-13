import { Inject, Injectable } from '@nestjs/common';
import { JwtSignServiceInterface } from '../interfaces/jwt-sign-service.interface';
import {
  JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
  JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
} from '../jwt.constants';
import { NestJwtService } from '../jwt.externals';
import {
  JwtSignOptions,
  JwtSignStringOptions,
  JwtTokenType,
} from '../jwt.types';

@Injectable()
export class JwtSignService implements JwtSignServiceInterface {
  constructor(
    @Inject(JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN)
    protected readonly jwtAccessService: NestJwtService,
    @Inject(JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN)
    protected readonly jwtRefreshService: NestJwtService,
  ) {}

  async signAsync(
    tokenType: JwtTokenType,
    payload: string,
    options?: JwtSignStringOptions,
  ): Promise<string>;

  async signAsync(
    tokenType: JwtTokenType,
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  async signAsync(
    tokenType: JwtTokenType,
    payload: string | Buffer | object,
    options?: JwtSignOptions,
  ) {
    if (typeof payload === 'string') {
      return this.service(tokenType).signAsync(payload, options);
    } else {
      return this.service(tokenType).signAsync(payload, options);
    }
  }

  async verifyAsync(
    tokenType: JwtTokenType,
    ...rest: Parameters<NestJwtService['verifyAsync']>
  ) {
    return this.service(tokenType).verifyAsync(...rest);
  }

  decode(
    tokenType: JwtTokenType,
    ...rest: Parameters<NestJwtService['decode']>
  ) {
    return this.service(tokenType).decode(...rest);
  }

  private service(tokenType: JwtTokenType): NestJwtService {
    switch (tokenType) {
      case 'access':
        return this.jwtAccessService;
      case 'refresh':
        return this.jwtRefreshService;
    }
  }
}
