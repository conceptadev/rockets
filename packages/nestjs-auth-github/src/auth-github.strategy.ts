import { Strategy } from 'passport-github';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

import {
  FederatedOAuthService,
  FederatedCredentialsInterface,
} from '@concepta/nestjs-federated';

import {
  AUTH_GITHUB_MODULE_SETTINGS_TOKEN,
  AUTH_GITHUB_STRATEGY_NAME,
} from './auth-github.constants';

import { AuthGithubSettingsInterface } from './interfaces/auth-github-settings.interface';

@Injectable()
export class AuthGithubStrategy extends PassportStrategy(
  Strategy,
  AUTH_GITHUB_STRATEGY_NAME,
) {
  constructor(
    @Inject(AUTH_GITHUB_MODULE_SETTINGS_TOKEN)
    config: AuthGithubSettingsInterface,
    private federatedOAuthService: FederatedOAuthService,
  ) {
    super({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: ReferenceIdInterface & ReferenceEmailInterface,
  ): Promise<FederatedCredentialsInterface> {
    //TODO: should we save accessToken and refreshToken?

    // Create a new user if it doesn't exist or just return based on federated
    const user = await this.federatedOAuthService.sign(
      AUTH_GITHUB_STRATEGY_NAME,
      profile.email,
      profile.id,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
