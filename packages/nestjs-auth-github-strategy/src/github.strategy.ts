import { Strategy } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  GetUserServiceInterface,
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
    private userService: GetUserServiceInterface<AuthenticationResponseInterface>,
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
  ): Promise<AuthenticationResponseInterface> {
    const user = await this.userService.getUser(profile);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      username: user.username,
      accessToken,
      refreshToken,
    } as AuthenticationResponseInterface;
  }
}
