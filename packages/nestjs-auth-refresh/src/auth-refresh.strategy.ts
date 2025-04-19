import { Inject, Injectable } from '@nestjs/common';
import {
  PassportStrategyFactory,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import {
  createVerifyRefreshTokenCallback,
  JwtStrategy,
} from '@concepta/nestjs-jwt';
import { AuthorizationPayloadInterface } from '@concepta/nestjs-common';

import {
  AUTH_REFRESH_MODULE_SETTINGS_TOKEN,
  AUTH_REFRESH_MODULE_STRATEGY_NAME,
  AuthRefreshUserModelService,
  AuthRefreshVerifyService,
} from './auth-refresh.constants';

import { AuthRefreshSettingsInterface } from './interfaces/auth-refresh-settings.interface';
import { AuthRefreshUserModelServiceInterface } from './interfaces/auth-refresh-user-model-service.interface';
import { AuthRefreshUnauthorizedException } from './exceptions/auth-refresh-unauthorized.exception';

@Injectable()
export class AuthRefreshStrategy extends PassportStrategyFactory<JwtStrategy>(
  JwtStrategy,
  AUTH_REFRESH_MODULE_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_REFRESH_MODULE_SETTINGS_TOKEN)
    settings: Partial<AuthRefreshSettingsInterface>,
    @Inject(AuthRefreshVerifyService)
    verifyTokenService: VerifyTokenServiceInterface,
    @Inject(AuthRefreshUserModelService)
    private userModelService: AuthRefreshUserModelServiceInterface,
  ) {
    const options: Partial<AuthRefreshSettingsInterface> = {
      verifyToken: createVerifyRefreshTokenCallback(verifyTokenService),
      ...settings,
    };

    super(options);
  }

  /**
   * Validate the user sub from the verified token
   *
   * @param payload - Authorization payload
   */
  async validate(payload: AuthorizationPayloadInterface) {
    const user = await this.userModelService.bySubject(payload.sub);

    if (!user) {
      throw new AuthRefreshUnauthorizedException();
    }

    return user;
  }
}
