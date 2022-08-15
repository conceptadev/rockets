import {
  BadRequestException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { JwtVerifyService } from '@concepta/nestjs-jwt';
import { AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN } from '../authentication.constants';
import { ValidateTokenServiceInterface } from '../interfaces/validate-token-service.interface';
import { VerifyTokenServiceInterface } from '../interfaces/verify-token-service.interface';

@Injectable()
export class VerifyTokenService implements VerifyTokenServiceInterface {
  constructor(
    private jwtVerifyService: JwtVerifyService,
    @Optional()
    @Inject(AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN)
    private validateTokenService?: ValidateTokenServiceInterface,
  ) {}

  /**
   * Verify an access token.
   */
  async accessToken(...args: Parameters<JwtVerifyService['accessToken']>) {
    // decode the token
    const token = await this.jwtVerifyService.accessToken(...args);

    // try to validate the token
    if (await this.validateToken(token)) {
      return token;
    } else {
      throw new BadRequestException(
        'Access token was verified, but failed further validation.',
      );
    }
  }

  /**
   * Verify a refresh token.
   */
  async refreshToken(...args: Parameters<JwtVerifyService['refreshToken']>) {
    // decode the token
    const token = await this.jwtVerifyService.refreshToken(...args);

    // try to validate the token
    if (await this.validateToken(token)) {
      return token;
    } else {
      throw new BadRequestException(
        'Refresh token was verified, but failed further validation.',
      );
    }
  }

  /**
   * Further validate the authenticity of a token.
   *
   * For example, You may want to check if it's id exists in a database or some other source.
   *
   * @param {object} payload
   * @returns {boolean}
   */
  private async validateToken(
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    if (this.validateTokenService) {
      return this.validateTokenService.validateToken(payload);
    } else {
      return true;
    }
  }
}
