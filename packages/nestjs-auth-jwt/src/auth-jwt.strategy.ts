import { Inject, Injectable } from '@nestjs/common';
import {
  ReferenceIdInterface,
  AuthorizationPayloadInterface,
} from '@concepta/nestjs-common';
import {
  PassportStrategyFactory,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import {
  createVerifyAccessTokenCallback,
  JwtStrategy,
  JwtStrategyOptionsInterface,
} from '@concepta/nestjs-jwt';

import {
  AUTH_JWT_STRATEGY_NAME,
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AuthJwtUserModelService,
  AuthJwtVerifyTokenService,
} from './auth-jwt.constants';

import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';
import { AuthJwtUserModelServiceInterface } from './interfaces/auth-jwt-user-model-service.interface';
import { AuthJwtUnauthorizedException } from './exceptions/auth-jwt-unauthorized.exception';

@Injectable()
export class AuthJwtStrategy extends PassportStrategyFactory<JwtStrategy>(
  JwtStrategy,
  AUTH_JWT_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_JWT_MODULE_SETTINGS_TOKEN)
    settings: Partial<AuthJwtSettingsInterface>,
    @Inject(AuthJwtVerifyTokenService)
    verifyTokenService: VerifyTokenServiceInterface,
    @Inject(AuthJwtUserModelService)
    private userModelService: AuthJwtUserModelServiceInterface,
  ) {
    const options: Partial<JwtStrategyOptionsInterface> = {
      verifyToken: createVerifyAccessTokenCallback(verifyTokenService),
      ...settings,
    };

    super(options);
  }

  /**
   * Validate the user based on payload sub
   *
   * @param payload - The payload to validate
   */
  async validate(
    payload: AuthorizationPayloadInterface,
  ): Promise<ReferenceIdInterface> {
    const user = await this.userModelService.bySubject(payload.sub);

    if (user) {
      return user;
    } else {
      throw new AuthJwtUnauthorizedException();
    }
  }
}
