import { Injectable } from '@nestjs/common';

import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenInterface,
  CredentialLookupInterface,
  CredentialLookupServiceInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';

@Injectable()
export class IssueTokenService implements IssueTokenServiceInterface {
  constructor(private jwtService: JwtService) {}

  /**
   * Generate access token for a payload
   * @param username user name to generate payload
   * @returns
   */
  async issueAccessToken(username: string): Promise<AccessTokenInterface> {
    const payload = { sub: username };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: 'secret',
    });

    return new Promise<AccessTokenInterface>((resolve) => {
      resolve({
        accessToken: accessToken,
        expireIn: new Date(),
      });
    });
  }
}
