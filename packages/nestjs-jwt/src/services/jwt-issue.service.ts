import { Inject, Injectable } from '@nestjs/common';
import { JwtIssueServiceInterface } from '../interfaces/jwt-issue-service.interface';
import { JwtSignService } from './jwt-sign.service';
import { JwtSignOptions, JwtSignStringOptions } from '../jwt.types';
import { JwtSignServiceInterface } from '../interfaces/jwt-sign-service.interface';

@Injectable()
export class JwtIssueService implements JwtIssueServiceInterface {
  constructor(
    @Inject(JwtSignService)
    protected readonly jwtSignService: JwtSignServiceInterface,
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
      return this.jwtSignService.signAsync('access', payload, options);
    } else {
      return this.jwtSignService.signAsync('access', payload, options);
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
      return this.jwtSignService.signAsync('refresh', payload, options);
    } else {
      return this.jwtSignService.signAsync('refresh', payload, options);
    }
  }
}
