import { Injectable } from '@nestjs/common';
import { JwtSignService } from '@rockts-org/nestjs-jwt';
//import { RefreshTokenService } from '@rockts-org/nestjs-refresh-token';
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
  async accessToken(
    payload: string | { [key: string]: unknown },
  ): Promise<string> {
    return this.signAsync(payload, { expiresIn: '15m' });
  }

  /**
   * Generate refresh token for a payload.
   *
   * @param username user id or name for `sub` claim
   */
  //TODO: should i point this to the new refresh token? or remove?
  async refreshToken(
    payload: string | { [key: string]: unknown },
  ): Promise<string> {
    return this.signAsync(payload, { expiresIn: '1w' });
  }

  /**
   * Generate the response payload.
   *
   * @param username user id or name for `sub` claim
   */
  async responsePayload(id: string): Promise<AuthenticationResponseInterface> {
    const payload = { sub: id };
    return {
      accessToken: await this.accessToken(payload),
      refreshToken: await this.refreshToken(payload),
    };
  }

  async responsePayloadObj(payload: {
    [key: string]: unknown;
  }): Promise<AuthenticationResponseInterface> {
    return {
      accessToken: await this.accessToken(payload),
      refreshToken: await this.refreshToken(payload),
    };
  }

  async signAsync(
    payload: string | { [key: string]: unknown },
    options?: { [key: string]: unknown },
  ): Promise<string> {
    return this.jwtSignService.signAsync(payload, options);
  }
}
