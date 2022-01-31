import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import {
  CredentialLookupInterface,
  DecodeTokenService,
  PassportStrategyFactory,
} from '@rockts-org/nestjs-authentication';
import {
  AUTH_JWT_REFRESH_STRATEGY_NAME,
  REFRESH_TOKEN_MODULE_SETTINGS_TOKEN,
} from './auth-refresh.constants';
import { AuthRefreshSettingsInterface } from './interfaces/auth-refresh-settings.interface';
import { AuthRefreshPayloadInterface } from './interfaces/auth-refresh-payload.interface';
import { RefreshUserLookupService } from './services/refresh-user-lookup.service';

@Injectable()
export class AuthRefreshStrategy extends PassportStrategyFactory(
  Strategy,
  AUTH_JWT_REFRESH_STRATEGY_NAME,
) {
  constructor(
    @Inject(REFRESH_TOKEN_MODULE_SETTINGS_TOKEN)
    settings: AuthRefreshSettingsInterface,
    private refreshUserLookupService: RefreshUserLookupService,
    decodeTokenService: DecodeTokenService,
  ) {
    // TODO: this settings should be the same of the jwt one?
    super({
      //TODO: Ho to define the property to get information?
      jwtFromRequest: ExtractJwt.fromBodyField('authRefresh'),
      ignoreExpiration: settings.ignoreExpiration,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        const key = await decodeTokenService.verifyToken(rawJwtToken);

        //TODO: Maybe check if the token belongs to the user here?

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

  async validate(
    payload: AuthRefreshPayloadInterface,
  ): Promise<CredentialLookupInterface> {
    // break out the fields
    const { sub } = payload;

    const user = await this.refreshUserLookupService.getUser(sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
