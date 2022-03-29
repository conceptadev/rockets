import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IdentityInterface } from '@concepta/nestjs-common';
import {
  PassportStrategyFactory,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import { JwtStrategy, JwtStrategyOptionsInterface } from '@concepta/nestjs-jwt';
import {
  AUTH_JWT_REFRESH_STRATEGY_NAME,
  AUTH_REFRESH_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_REFRESH_VERIFY_TOKEN_SERVICE_TOKEN,
  REFRESH_TOKEN_MODULE_SETTINGS_TOKEN,
} from './auth-refresh.constants';
import { AuthRefreshSettingsInterface } from './interfaces/auth-refresh-settings.interface';
import { AuthRefreshPayloadInterface } from './interfaces/auth-refresh-payload.interface';
import { createVerifyTokenCallback } from './utils/create-verify-token-callback.util';
import { AuthRefreshUserLookupServiceInterface } from './interfaces/auth-refresh-user-lookup-service.interface';

@Injectable()
export class AuthRefreshStrategy extends PassportStrategyFactory<JwtStrategy>(
  JwtStrategy,
  AUTH_JWT_REFRESH_STRATEGY_NAME,
) {
  @Inject(AUTH_REFRESH_USER_LOOKUP_SERVICE_TOKEN)
  private userLookupService: AuthRefreshUserLookupServiceInterface;

  constructor(
    @Inject(REFRESH_TOKEN_MODULE_SETTINGS_TOKEN)
    settings: AuthRefreshSettingsInterface,
    @Inject(AUTH_REFRESH_VERIFY_TOKEN_SERVICE_TOKEN)
    verifyTokenService: VerifyTokenServiceInterface,
  ) {
    const options: JwtStrategyOptionsInterface = {
      verifyToken: createVerifyTokenCallback(verifyTokenService),
      ...settings,
    };

    super(options);
  }

  /**
   * Validate the user id from the verified token
   *
   * @param username The username to authenticate
   * @param password
   * @returns
   */

  async validate(
    payload: AuthRefreshPayloadInterface,
  ): Promise<IdentityInterface> {
    const { sub } = payload;

    const user = await this.userLookupService.getById(sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
