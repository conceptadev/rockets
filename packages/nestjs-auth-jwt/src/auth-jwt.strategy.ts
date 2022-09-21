import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { AuthorizationPayloadInterface } from '@concepta/ts-common';
import {
  PassportStrategyFactory,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import { JwtStrategy, JwtStrategyOptionsInterface } from '@concepta/nestjs-jwt';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

import {
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
  AUTH_JWT_STRATEGY_NAME,
} from './auth-jwt.constants';

import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';
import { AuthJwtUserLookupServiceInterface } from './interfaces/auth-jwt-user-lookup-service.interface';
import { createVerifyTokenCallback } from './utils/create-verify-token-callback.util';

@Injectable()
export class AuthJwtStrategy extends PassportStrategyFactory<JwtStrategy>(
  JwtStrategy,
  AUTH_JWT_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_JWT_MODULE_SETTINGS_TOKEN)
    settings: Partial<AuthJwtSettingsInterface>,
    @Inject(AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN)
    verifyTokenService: VerifyTokenServiceInterface,
    @Inject(AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private userLookupService: AuthJwtUserLookupServiceInterface,
  ) {
    const options: Partial<JwtStrategyOptionsInterface> = {
      verifyToken: createVerifyTokenCallback(verifyTokenService),
      ...settings,
    };

    super(options);
  }

  /**
   * Validate the user based on payload sub
   *
   * @param payload The payload to validate
   */
  async validate(
    payload: AuthorizationPayloadInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceIdInterface> {
    const user = await this.userLookupService.bySubject(
      payload.sub,
      queryOptions,
    );

    if (user) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
