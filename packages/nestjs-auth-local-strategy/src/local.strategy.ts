import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
  PasswordStorageService,
} from '@rockts-org/nestjs-authentication';
import {
  GET_USER_SERVICE_TOKEN,
  ISSUE_TOKEN_SERVICE_TOKEN,
} from './config/local.config';

/**
 * This implementation should be used to use @AuthGuard('local')
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @Inject(GET_USER_SERVICE_TOKEN)
    private userService: GetUserServiceInterface<CredentialLookupInterface>,
    //TODO: Move Service to inside Local?
    private passwordService: PasswordStorageService,
    @Inject(ISSUE_TOKEN_SERVICE_TOKEN)
    private issueTokenService: IssueTokenServiceInterface,
  ) {
    super();
  }

  async validate(
    username: string,
    pass: string,
  ): Promise<AuthenticationResponseInterface> {
    const user = await this.userService.getUser(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    // validate password
    const isValid = await this.passwordService.validatePassword(
      pass,
      user.password,
      user.salt,
    );
    if (!isValid) throw new UnauthorizedException();

    // generate token
    const token = await this.issueTokenService.issueAccessToken(username);

    return {
      id: user.id,
      username: user.username,
      ...token,
    } as AuthenticationResponseInterface;
  }
}
