import { Inject, Injectable } from '@nestjs/common';
import { JwtIssueTokenServiceInterface } from '../interfaces/jwt-issue-token-service.interface';
import { JwtSignServiceInterface } from '../interfaces/jwt-sign-service.interface';
import { JwtAccessService, JwtRefreshService } from '../jwt.constants';
import { JwtSignOptions, JwtSignStringOptions } from '../jwt.types';

@Injectable()
export class JwtIssueTokenService implements JwtIssueTokenServiceInterface {
  constructor(
    @Inject(JwtAccessService)
    protected readonly jwtAccessService: JwtSignServiceInterface,
    @Inject(JwtRefreshService)
    protected readonly jwtRefreshService: JwtSignServiceInterface,
  ) {}

  accessToken(payload: string, options?: JwtSignStringOptions): Promise<string>;

  accessToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  async accessToken(
    payload: string | Buffer | object,
    options?: JwtSignOptions,
  ) {
    if (typeof payload === 'string') {
      return this.jwtAccessService.signAsync(payload, options);
    } else {
      return this.jwtAccessService.signAsync(payload, options);
    }
  }

  refreshToken(
    payload: string,
    options?: JwtSignStringOptions,
  ): Promise<string>;

  refreshToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  async refreshToken(
    payload: string | Buffer | object,
    options?: JwtSignOptions,
  ) {
    if (typeof payload === 'string') {
      return this.jwtRefreshService.signAsync(payload, options);
    } else {
      return this.jwtRefreshService.signAsync(payload, options);
    }
  }
}
