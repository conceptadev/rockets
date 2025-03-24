import { Inject, Injectable, Optional } from '@nestjs/common';
import { AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN } from '../../core/authentication.constants';
import { ValidateTokenServiceInterface } from '../../core/interfaces/validate-token-service.interface';
import { VerifyTokenServiceInterface } from '../../core/interfaces/verify-token-service.interface';
import { AuthenticationAccessTokenException } from '../../core/exceptions/authentication-access-token.exception';
import { AuthenticationRefreshTokenException } from '../../core/exceptions/authentication-refresh-token.exception';
import { JwtVerifyTokenService } from './jwt-verify-token.service';

@Injectable()
export class VerifyTokenService implements VerifyTokenServiceInterface {
  constructor(
    protected readonly jwtVerifyTokenService: JwtVerifyTokenService,
    @Optional()
    @Inject(AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN)
    protected readonly validateTokenService?: ValidateTokenServiceInterface,
  ) {}

  /**
   * Verify an access token.
   */
  async accessToken(...args: Parameters<JwtVerifyTokenService['accessToken']>) {
    // decode the token
    const token = await this.jwtVerifyTokenService.accessToken(...args);

    // try to validate the token
    if (await this.validateToken(token)) {
      return token;
    } else {
      throw new AuthenticationAccessTokenException();
    }
  }

  /**
   * Verify a refresh token.
   */
  async refreshToken(
    ...args: Parameters<JwtVerifyTokenService['refreshToken']>
  ) {
    // decode the token
    const token = await this.jwtVerifyTokenService.refreshToken(...args);

    // try to validate the token
    if (await this.validateToken(token)) {
      return token;
    } else {
      throw new AuthenticationRefreshTokenException();
    }
  }

  /**
   * Further validate the authenticity of a token.
   *
   * For example, You may want to check if it's id exists in a database or some other source.
   *
   * @param payload - Payload object
   */
  private async validateToken(payload: object): Promise<boolean> {
    if (this.validateTokenService) {
      return this.validateTokenService.validateToken(payload);
    } else {
      return true;
    }
  }
}
