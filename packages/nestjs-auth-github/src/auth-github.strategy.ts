import { Strategy } from 'passport-github';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  FederatedOAuthService,
  FederatedCredentialsInterface,
} from '@concepta/nestjs-federated';

import {
  AUTH_GITHUB_MODULE_SETTINGS_TOKEN,
  AUTH_GITHUB_STRATEGY_NAME,
} from './auth-github.constants';

import { AuthGithubSettingsInterface } from './interfaces/auth-github-settings.interface';
import { AuthGithubProfileInterface } from './interfaces/auth-github-profile.interface';
import { AuthGithubMissingEmailException } from './exceptions/auth-github-missing-email.exception';
import { AuthGithubMissingIdException } from './exceptions/auth-github-missing-id.exception';
import { mapProfile } from './utils/auth-github-map-profile';

@Injectable()
export class AuthGithubStrategy extends PassportStrategy(
  Strategy,
  AUTH_GITHUB_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_GITHUB_MODULE_SETTINGS_TOKEN)
    private settings: AuthGithubSettingsInterface,
    private federatedOAuthService: FederatedOAuthService,
  ) {
    super({
      clientID: settings?.clientId,
      clientSecret: settings?.clientSecret,
      callbackURL: settings?.callbackURL,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: AuthGithubProfileInterface,
  ): Promise<FederatedCredentialsInterface> {
    const gitProfile = this.settings.mapProfile
      ? this.settings.mapProfile(profile)
      : mapProfile(profile);

    if (!gitProfile?.id) {
      throw new AuthGithubMissingIdException();
    }

    if (!gitProfile?.email) {
      throw new AuthGithubMissingEmailException();
    }

    // Create a new user if it doesn't exist or just return based on federated
    const user = await this.federatedOAuthService.sign(
      AUTH_GITHUB_STRATEGY_NAME,
      gitProfile.email,
      gitProfile.id,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
