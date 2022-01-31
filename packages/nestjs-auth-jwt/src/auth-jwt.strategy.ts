import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_STRATEGY_NAME,
} from './auth-jwt.constants';
import {
  DecodeTokenService,
  PassportStrategyFactory,
} from '@rockts-org/nestjs-authentication';
import { AuthJwtPayloadDto } from './dto/auth-jwt-payload.dto';
import { AuthJwtResponseDto } from './dto/auth-jwt-response.dto';
import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';

@Injectable()
export class AuthJwtStrategy extends PassportStrategyFactory(
  Strategy,
  AUTH_JWT_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_JWT_MODULE_SETTINGS_TOKEN)
    settings: AuthJwtSettingsInterface,
    decodeTokenService: DecodeTokenService,
  ) {
    // TODO: this settings should be the same of the jwt one?
    super({
      //TODO: Should i get the extract from a different service?
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: settings.ignoreExpiration,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        //TODO: we will need to review this
        const key = await decodeTokenService.verifyToken(rawJwtToken);

        //done(error, secret_key);
        done(null, key);
      },
    });
  }
  /**
   * Validate the user based on the username and password
   * from the request body
   *
   * @param username The username to authenticate
   * @param password
   * @returns
   */

  async validate(payload: AuthJwtPayloadDto): Promise<AuthJwtResponseDto> {
    return {
      userId: payload.sub,
      username: payload.username,
    } as AuthJwtResponseDto;
  }
}
