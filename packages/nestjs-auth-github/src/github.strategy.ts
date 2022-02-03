import { Strategy } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticationJwtResponseInterface,
  UserLookupServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { GITHUB_MODULE_OPTIONS_TOKEN } from './config/github.config';
import { GithubOptionsInterface } from './interfaces/github-options.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  GITHUB_MODULE_OPTIONS_TOKEN,
) {
  constructor(
    @Inject(GITHUB_MODULE_OPTIONS_TOKEN)
    private config: GithubOptionsInterface,
    private userService: UserLookupServiceInterface,
  ) {
    super({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
    });
  }

  async validate(
    accessToken,
    refreshToken,
    profile,
  ): Promise<AuthenticationJwtResponseInterface> {
    const user = await this.userService.getUser(profile);

    if (!user || !refreshToken) {
      throw new UnauthorizedException();
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
