import { Injectable } from '@nestjs/common';
import { JwtIssueServiceInterface } from '../interfaces/jwt-issue-service.interface';
import { JwtSignService } from './jwt-sign.service';

@Injectable()
export class JwtIssueService implements JwtIssueServiceInterface {
  constructor(private jwtSignService: JwtSignService) {}

  async accessToken<T extends JwtSignService['signAsync']>(
    payload: T,
  ): Promise<string> {
    return this.jwtSignService.signAsync(payload);
  }

  async refreshToken<T extends JwtSignService['signAsync']>(
    payload: T,
  ): Promise<string> {
    return this.jwtSignService.signAsync(payload);
  }
}
