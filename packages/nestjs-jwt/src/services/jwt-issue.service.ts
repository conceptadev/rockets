import { Inject, Injectable } from '@nestjs/common';
import {
  AccessTokenInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { JwtSignServiceInterface } from '../interfaces/jwt-sign-service.interface';
import { JwtSignService } from './jwt-sign.service';

@Injectable()
export class JwtIssueService implements IssueTokenServiceInterface {
  constructor(
    @Inject(JwtSignService)
    private jwtSignService: JwtSignServiceInterface,
  ) {}

  /**
   * Generate access token for a payload
   * @param username user name to generate payload
   * @returns
   */
  async issueAccessToken(username: string): Promise<AccessTokenInterface> {
    const payload = { sub: username };

    const accessToken = await this.jwtSignService.signAsync(payload);

    return new Promise<AccessTokenInterface>((resolve) => {
      resolve({
        accessToken: accessToken,
        expireIn: new Date(),
      });
    });
  }
}
