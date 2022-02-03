import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  JwtStrategy,
  JwtStrategyOptionsInterface,
} from '@rockts-org/nestjs-jwt';
import {
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
  AUTH_JWT_STRATEGY_NAME,
} from './auth-jwt.constants';
import {
  PassportStrategyFactory,
  UserIdentityInterface,
} from '@rockts-org/nestjs-authentication';
import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';
import { AuthJwtPayloadDto } from './dto/auth-jwt-payload.dto';
import { createVerifyTokenCallback } from './utils/create-verify-token-callback.util';
import { AuthJwtUserLookupServiceInterface } from './interfaces/auth-jwt-user-lookup.interface';
import { VerifyTokenServiceInterface } from '@rockts-org/nestjs-authentication/src/interfaces/verify-token-service.interface';

@Injectable()
export class AuthJwtStrategy extends PassportStrategyFactory<JwtStrategy>(
  JwtStrategy,
  AUTH_JWT_STRATEGY_NAME,
) {
  @Inject(AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN)
  private userLookupService: AuthJwtUserLookupServiceInterface;

  constructor(
    @Inject(AUTH_JWT_MODULE_SETTINGS_TOKEN)
    settings: AuthJwtSettingsInterface,
    @Inject(AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN)
    verifyTokenService: VerifyTokenServiceInterface,
  ) {
    const options: JwtStrategyOptionsInterface = {
      verifyToken: createVerifyTokenCallback(verifyTokenService),
      ...settings,
    };

    super(options);
  }

  /**
   * Validate the user based on payload sub
   *
   * @param {AuthJwtPayloadDto} payload
   * @returns {UserIdentityInterface}
   */
  async validate(payload: AuthJwtPayloadDto): Promise<UserIdentityInterface> {
    const user = this.userLookupService.getUser(payload.sub);

    if (user) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
