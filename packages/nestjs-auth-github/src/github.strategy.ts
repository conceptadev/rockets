import { Strategy } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IdentityInterface } from '@concepta/nestjs-common';
import { AuthenticationJwtResponseInterface } from '@concepta/nestjs-authentication';
import { GITHUB_MODULE_OPTIONS_TOKEN } from './config/github.config';
import { GithubOptionsInterface } from './interfaces/github-options.interface';
import { AuthGithubUserLookupServiceInterface } from './interfaces/auth-github-user-lookup-service.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  GITHUB_MODULE_OPTIONS_TOKEN,
) {
  constructor(
    @Inject(GITHUB_MODULE_OPTIONS_TOKEN)
    private config: GithubOptionsInterface,
    private userLookupService: AuthGithubUserLookupServiceInterface,
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
    profile: IdentityInterface,
  ): Promise<AuthenticationJwtResponseInterface> {
    const user = await this.userLookupService.getById(profile.id);

    if (!user || !refreshToken) {
      throw new UnauthorizedException();
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
