import { Injectable } from '@nestjs/common';

import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenInterface,
  CredentialLookupInterface,
  CredentialLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';

@Injectable()
export class UserLookupService implements CredentialLookupServiceInterface {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async getUser(username: string): Promise<CredentialLookupInterface> {
    const user = await this.userService.getUserByUsername(username);

    return {
      username: user.username,
      password: user.password,
      salt: user.salt,
    } as CredentialLookupInterface;
  }

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

  /**
   * refresh access token
   * @param accessToken
   * @returns
   */
  async refreshToken(accessToken: string): Promise<AccessTokenInterface> {
    const payload = { accessToken: accessToken };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: 'secret',
    });
    return new Promise<AccessTokenInterface>((resolve) => {
      resolve({
        accessToken: refreshToken,
        expireIn: new Date(),
      });
    });
  }
}
