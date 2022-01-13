import { Injectable } from '@nestjs/common';
import { JwtSignService } from '@rockts-org/nestjs-jwt';
import { AuthenticationResponseInterface } from '../interfaces/authentication-response.interface';
import { IssueTokenServiceInterface } from '../interfaces/issue-token-service.interface';

@Injectable()
export class IssueTokenService implements IssueTokenServiceInterface {
  constructor(private jwtSignService: JwtSignService) {}

  /**
   * Generate access token for a payload.
   *
   * @param id user id or name for `sub` claim
   */
  async accessToken(id: string): Promise<string> {
    const payload = { sub: id };

    return this.jwtSignService.signAsync(payload);
  }

  /**
   * Generate refresh token for a payload.
   *
   * @param username user id or name for `sub` claim
   */
  async refreshToken(id: string): Promise<string> {
    const payload = { sub: id };

    return this.jwtSignService.signAsync(payload);
  }

  /**
   * Generate the response payload.
   *
   * @param username user id or name for `sub` claim
   */
  async responsePayload(id: string): Promise<AuthenticationResponseInterface> {
    return {
      accessToken: await this.accessToken(id),
      refreshToken: await this.refreshToken(id),
    };
  }
}
