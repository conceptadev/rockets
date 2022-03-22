import { Injectable } from '@nestjs/common';
import { JwtIssueService } from '@concepta/nestjs-jwt';
import { AuthenticationJwtResponseInterface } from '../interfaces/authentication-jwt-response.interface';
import { IssueTokenServiceInterface } from '../interfaces/issue-token-service.interface';

@Injectable()
export class IssueTokenService implements IssueTokenServiceInterface {
  constructor(private jwtIssueService: JwtIssueService) {}

  /**
   * Generate access token for a payload.
   */
  async accessToken(...args: Parameters<JwtIssueService['accessToken']>) {
    return this.jwtIssueService.accessToken(...args);
  }

  /**
   * Generate refresh token for a payload.
   */
  async refreshToken(...args: Parameters<JwtIssueService['refreshToken']>) {
    return this.jwtIssueService.refreshToken(...args);
  }

  /**
   * Generate the response payload.
   *
   * @param identifier user id or name for `sub` claim
   */
  async responsePayload(
    id: string,
  ): Promise<AuthenticationJwtResponseInterface> {
    // TODO: need pattern for events and/or callbacks to mutate this object before signing
    const payload = { sub: id };

    // return the payload
    return {
      accessToken: await this.accessToken(payload),
      refreshToken: await this.refreshToken(payload),
    };
  }
}
