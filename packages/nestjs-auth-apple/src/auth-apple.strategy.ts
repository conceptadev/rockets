import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  FederatedOAuthService,
  FederatedCredentialsInterface,
} from '@concepta/nestjs-federated';

import {
  AUTH_APPLE_MODULE_SETTINGS_TOKEN,
  AUTH_APPLE_STRATEGY_NAME,
} from './auth-apple.constants';

import { AuthAppleSettingsInterface } from './interfaces/auth-apple-settings.interface';
import { AuthAppleProfileInterface } from './interfaces/auth-apple-profile.interface';
import { AuthAppleMissingEmailException } from './exceptions/auth-apple-missing-email.exception';
import { AuthAppleMissingIdException } from './exceptions/auth-apple-missing-id.exception';
import { mapProfile } from './utils/auth-apple-map-profile';
import { Strategy } from 'passport-apple';

@Injectable()
export class AuthAppleStrategy extends PassportStrategy(
  Strategy,
  AUTH_APPLE_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_APPLE_MODULE_SETTINGS_TOKEN)
    private settings: AuthAppleSettingsInterface,
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
    profile: AuthAppleProfileInterface,
  ): Promise<FederatedCredentialsInterface> {
    const appleProfile = this.settings.mapProfile
      ? this.settings.mapProfile(profile)
      : mapProfile(profile);

    if (!appleProfile?.id) {
      throw new AuthAppleMissingIdException();
    }

    if (!appleProfile?.email) {
      throw new AuthAppleMissingEmailException();
    }

    // Create a new user if it doesn't exist or just return based on federated
    const user = await this.federatedOAuthService.sign(
      AUTH_APPLE_STRATEGY_NAME,
      appleProfile.email,
      appleProfile.id,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
