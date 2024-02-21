import { Injectable } from '@nestjs/common';
import { JwtIssueServiceInterface } from '../interfaces/jwt-issue-service.interface';
import { JwtSignService } from './jwt-sign.service';

@Injectable()
export class JwtIssueService implements JwtIssueServiceInterface {
  constructor(protected readonly jwtSignService: JwtSignService) {}

  async accessToken(
    ...args: Parameters<JwtIssueServiceInterface['accessToken']>
  ) {
    return this.jwtSignService.signAsync('access', ...args);
  }

  async refreshToken(
    ...args: Parameters<JwtIssueServiceInterface['refreshToken']>
  ) {
    return this.jwtSignService.signAsync('refresh', ...args);
  }
}
