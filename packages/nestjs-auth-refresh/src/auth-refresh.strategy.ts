import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  PassportStrategyFactory,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import { JwtStrategy } from '@concepta/nestjs-jwt';
import {
  AUTH_JWT_REFRESH_STRATEGY_NAME,
  AUTH_REFRESH_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_REFRESH_VERIFY_TOKEN_SERVICE_TOKEN,
  REFRESH_TOKEN_MODULE_SETTINGS_TOKEN,
} from './auth-refresh.constants';
import { AuthRefreshSettingsInterface } from './interfaces/auth-refresh-settings.interface';
import { AuthRefreshUserLookupServiceInterface } from './interfaces/auth-refresh-user-lookup-service.interface';
import { AuthRefreshPayloadInterface } from './interfaces/auth-refresh-payload.interface';
import { createVerifyTokenCallback } from './utils/create-verify-token-callback.util';

@Injectable()
export class AuthRefreshStrategy extends PassportStrategyFactory<JwtStrategy>(
  JwtStrategy,
  AUTH_JWT_REFRESH_STRATEGY_NAME,
) {
  constructor(
    @Inject(REFRESH_TOKEN_MODULE_SETTINGS_TOKEN)
    settings: Partial<AuthRefreshSettingsInterface>,
    @Inject(AUTH_REFRESH_VERIFY_TOKEN_SERVICE_TOKEN)
    verifyTokenService: VerifyTokenServiceInterface,
    @Inject(AUTH_REFRESH_USER_LOOKUP_SERVICE_TOKEN)
    private userLookupService: AuthRefreshUserLookupServiceInterface,
  ) {
    const options: Partial<AuthRefreshSettingsInterface> = {
      verifyToken: createVerifyTokenCallback(verifyTokenService),
      ...settings,
    };

    super(options);
  }

  /**
   * Validate the user sub from the verified token
   *
   * @param payload
   */
  async validate(payload: AuthRefreshPayloadInterface) {
    const user = await this.userLookupService.bySubject(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
