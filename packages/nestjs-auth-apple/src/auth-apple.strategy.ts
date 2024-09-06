import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  FederatedOAuthService,
  FederatedCredentialsInterface,
} from '@concepta/nestjs-federated';

import {
  AUTH_APPLE_MODULE_SETTINGS_TOKEN,
  AUTH_APPLE_SERVICE_TOKEN,
  AUTH_APPLE_STRATEGY_NAME,
} from './auth-apple.constants';

import { AuthAppleSettingsInterface } from './interfaces/auth-apple-settings.interface';
import { AuthAppleMissingEmailException } from './exceptions/auth-apple-missing-email.exception';
import { AuthAppleMissingIdException } from './exceptions/auth-apple-missing-id.exception';
import { Strategy } from 'passport-apple';
import { AuthAppleServiceInterface } from './interfaces/auth-apple-service.interface';
import { mapProfile } from './utils/auth-apple-map-profile';
import { AuthAppleCredentialsInterface } from './interfaces/auth-apple-credentials.interface';

@Injectable()
export class AuthAppleStrategy extends PassportStrategy(
  Strategy,
  AUTH_APPLE_STRATEGY_NAME,
  5,
) {
  constructor(
    @Inject(AUTH_APPLE_MODULE_SETTINGS_TOKEN)
    private settings: AuthAppleSettingsInterface,
    private federatedOAuthService: FederatedOAuthService,
    @Inject(AUTH_APPLE_SERVICE_TOKEN)
    private authAppleService: AuthAppleServiceInterface,
  ) {
    super({
      clientID: settings?.clientID,
      teamID: settings?.teamID,
      keyID: settings?.keyID,
      privateKeyLocation: settings?.privateKeyLocation,
      privateKeyString: settings?.privateKeyString,
      callbackURL: settings?.callbackURL,
      scope: settings?.scope,
      passReqToCallback: false,
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    idToken: string,
  ): Promise<FederatedCredentialsInterface> {
    // verify and decode token
    const profile = await this.authAppleService.verifyIdToken(idToken);

    // validate the claims of the token (expired, active email, issuer, etc)
    await this.authAppleService.validateClaims(profile);

    const appleProfile = this.settings.mapProfile
      ? this.settings.mapProfile(profile)
      : mapProfile(profile);

    // make sure it was mapped correctly
    this.validateAppleProfile(appleProfile);

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

  private validateAppleProfile(
    appleProfile: AuthAppleCredentialsInterface,
  ): void {
    if (!appleProfile?.id) {
      throw new AuthAppleMissingIdException();
    }

    if (!appleProfile?.email) {
      throw new AuthAppleMissingEmailException();
    }
  }
}
