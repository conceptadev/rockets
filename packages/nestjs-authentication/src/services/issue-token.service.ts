import { Inject, Injectable } from '@nestjs/common';
import { ReferenceId } from '@concepta/nestjs-common';
import {
  JwtIssueTokenService,
  JwtIssueTokenServiceInterface,
  JwtSignOptions,
  JwtSignStringOptions,
} from '@concepta/nestjs-jwt';
import { AuthenticationResponseInterface } from '@concepta/nestjs-common';
import { IssueTokenServiceInterface } from '../interfaces/issue-token-service.interface';
import { AuthenticationJwtResponseDto } from '../dto/authentication-jwt-response.dto';

@Injectable()
export class IssueTokenService implements IssueTokenServiceInterface {
  constructor(
    @Inject(JwtIssueTokenService)
    protected readonly jwtIssueTokenService: JwtIssueTokenServiceInterface,
  ) {}

  /**
   * Generate access token for a payload.
   */
  accessToken(payload: string, options?: JwtSignStringOptions): Promise<string>;

  accessToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  async accessToken(
    payload: string | Buffer | object,
    options?: JwtSignOptions,
  ) {
    if (typeof payload === 'string') {
      return this.jwtIssueTokenService.accessToken(payload, options);
    } else {
      return this.jwtIssueTokenService.accessToken(payload, options);
    }
  }

  /**
   * Generate refresh token for a payload.
   */
  refreshToken(
    payload: string,
    options?: JwtSignStringOptions,
  ): Promise<string>;

  refreshToken(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;

  async refreshToken(
    payload: string | Buffer | object,
    options?: JwtSignOptions,
  ) {
    if (typeof payload === 'string') {
      return this.jwtIssueTokenService.refreshToken(payload, options);
    } else {
      return this.jwtIssueTokenService.refreshToken(payload, options);
    }
  }

  /**
   * Generate the response payload.
   *
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
