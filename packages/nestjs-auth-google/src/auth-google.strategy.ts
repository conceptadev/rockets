import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  FederatedOAuthService,
  FederatedCredentialsInterface,
} from '@concepta/nestjs-federated';

import {
  AUTH_GOOGLE_MODULE_SETTINGS_TOKEN,
  AUTH_GOOGLE_STRATEGY_NAME,
} from './auth-google.constants';

import { AuthGoogleSettingsInterface } from './interfaces/auth-google-settings.interface';
import { AuthGoogleProfileInterface } from './interfaces/auth-google-profile.interface';
import { AuthGoogleMissingEmailException } from './exceptions/auth-google-missing-email.exception';
import { AuthGoogleMissingIdException } from './exceptions/auth-google-missing-id.exception';
import { mapProfile } from './utils/auth-google-map-profile';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class AuthGoogleStrategy extends PassportStrategy(
  Strategy,
  AUTH_GOOGLE_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_GOOGLE_MODULE_SETTINGS_TOKEN)
    private settings: AuthGoogleSettingsInterface,
    private federatedOAuthService: FederatedOAuthService,
  ) {
    super({
      clientID: settings?.clientID,
      clientSecret: settings?.clientSecret,
      callbackURL: settings?.callbackURL,
      scope: settings?.scope,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: AuthGoogleProfileInterface,
  ): Promise<FederatedCredentialsInterface> {
    const googleProfile = this.settings.mapProfile
      ? this.settings.mapProfile(profile)
      : mapProfile(profile);

    if (!googleProfile?.id) {
      throw new AuthGoogleMissingIdException();
    }

    if (!googleProfile?.email) {
      throw new AuthGoogleMissingEmailException();
    }

    // Create a new user if it doesn't exist or just return based on federated
    const user = await this.federatedOAuthService.sign(
      AUTH_GOOGLE_STRATEGY_NAME,
      googleProfile.email,
      googleProfile.id,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
