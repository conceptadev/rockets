import { Injectable } from '@nestjs/common';
import { ReferenceId } from '@concepta/ts-core';
import { JwtIssueService } from '@concepta/nestjs-jwt';
import { AuthenticationResponseInterface } from '@concepta/ts-common';
import { IssueTokenServiceInterface } from '../interfaces/issue-token-service.interface';
import { AuthenticationJwtResponseDto } from '../dto/authentication-jwt-response.dto';

@Injectable()
export class IssueTokenService implements IssueTokenServiceInterface {
  constructor(protected readonly jwtIssueService: JwtIssueService) {}

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
   * @param id - user id or name for `sub` claim
   */
  async responsePayload(
    id: ReferenceId,
  ): Promise<AuthenticationResponseInterface> {
    // TODO: need pattern for events and/or callbacks to mutate this object before signing
    const payload = { sub: id };

    // create the dto
    const dto = new AuthenticationJwtResponseDto();

    // set access and refresh tokens
    dto.accessToken = await this.accessToken(payload);
    dto.refreshToken = await this.refreshToken(payload);

    // return the payload
    return dto;
  }
}
