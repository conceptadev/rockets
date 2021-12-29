import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  AuthUser,
  CredentialLookupInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { AuthGuard } from '@rockts-org/nestjs-authentication';
import {
  AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
} from './auth-local.constants';
import { AUTH_LOCAL_STRATEGY_NAME } from './auth-local.constants';
import { AuthLocalOptionsInterface } from './interfaces/auth-local-options.interface';

/**
 * Sign controller
 */
@Controller('auth')
export class AuthLocalController {
  constructor(
    @Inject(AUTH_LOCAL_MODULE_OPTIONS_TOKEN)
    private config: AuthLocalOptionsInterface,
    @Inject(AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Authenticate using guard
   * @param dto Body
   * @returns
   */
  @UseGuards(AuthGuard(AUTH_LOCAL_STRATEGY_NAME))
  @Post('login')
  async authenticateWithGuard(
    @AuthUser() user: CredentialLookupInterface,
  ): Promise<AuthenticationResponseInterface> {
    // issue a access token to sign in
    const token = this.issueTokenService.issueAccessToken(user.username);

    return {
      ...user,
      ...token,
    } as AuthenticationResponseInterface;
  }
}
