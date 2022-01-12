import { Inject, Injectable } from '@nestjs/common';
import {
  AccessTokenInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { JwtServiceInterface } from '../interfaces/jwt-service.interface';
import { JWT_MODULE_JWT_SERVICE_TOKEN } from '../jwt.constants';

@Injectable()
export class IssueTokenService implements IssueTokenServiceInterface {
  constructor(
    @Inject(JWT_MODULE_JWT_SERVICE_TOKEN)
    private jwtService: JwtServiceInterface,
  ) {}

  /**
   * Generate access token for a payload
   * @param username user name to generate payload
   * @returns
   */
  async issueAccessToken(username: string): Promise<AccessTokenInterface> {
    const payload = { sub: username };

    const accessToken = await this.jwtService.signAsync(payload);

    return new Promise<AccessTokenInterface>((resolve) => {
      resolve({
        accessToken: accessToken,
        expireIn: new Date(),
      });
    });
  }
}
