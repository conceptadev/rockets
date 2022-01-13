import { Injectable } from '@nestjs/common';
import { JwtSignService } from '@rockts-org/nestjs-jwt';
import { AccessTokenInterface } from '../interfaces/access-token.interface';
import { IssueTokenServiceInterface } from '../interfaces/issue-token-service.interface';

@Injectable()
export class IssueTokenService implements IssueTokenServiceInterface {
  constructor(private jwtSignService: JwtSignService) {}

  /**
   * Generate access token for a payload.
   *
   * @param username user name to generate payload
   * @returns
   */
  async accessToken(username: string): Promise<AccessTokenInterface> {
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
