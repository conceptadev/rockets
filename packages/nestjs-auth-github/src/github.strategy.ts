import { Strategy } from 'passport-github';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

import {
  FederatedOAuthService,
  FederatedCredentialsInterface,
} from '@concepta/nestjs-federated';

import {
  GITHUB_MODULE_SETTINGS_TOKEN,
  GITHUB_STRATEGY_NAME,
} from './github.constants';

import { GithubSettingsInterface } from './interfaces/github-settings.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  GITHUB_STRATEGY_NAME,
) {
  constructor(
    @Inject(GITHUB_MODULE_SETTINGS_TOKEN)
    config: GithubSettingsInterface,
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
      GITHUB_STRATEGY_NAME,
      profile.email,
      profile.id,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
