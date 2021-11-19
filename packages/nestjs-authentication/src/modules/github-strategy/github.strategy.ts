import { Strategy } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GetUserServiceInterface } from '../..';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private userService: GetUserServiceInterface
  ) {
    super({
      clientID: 'GITHUB_CLIENT_ID',
      clientSecret: 'GITHUB_CLIENT_SECRET',
      callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    });
  }

  async validate(accessToken, refreshToken, profile): Promise<any> {
    const user = await this.userService.getGithubProfileId(profile);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      username: user.username,
      accessToken,
      refreshToken
    };
  }
}

