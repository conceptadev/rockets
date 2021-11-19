import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GetUserServiceInterface, IssueTokenServiceInterface, PasswordStorageService } from '../..';

/**
 * This implementation should be used to use @AuthGuard('local')
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private userService: GetUserServiceInterface,
    private passwordService: PasswordStorageService,
    private issueTokenService: IssueTokenServiceInterface
  ) {
    super();
  }

  async validate(username: string, pass: string): Promise<any> {
    const user = await this.userService.getUser(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    // validate password
    const isValid = await this.passwordService.validatePassword(pass, user.password, user.salt)
    if (!isValid)
      throw new UnauthorizedException();
    
    // generate token
    const token = await this.issueTokenService.issueAccessToken(username);
    
    return {
      id: user.id,
      username: user.username,
      ...token
    };
  }
}

