import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  AuthUser,
  CredentialLookupInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { AuthGuard } from '@rockts-org/nestjs-authentication';
import { ISSUE_TOKEN_SERVICE_TOKEN } from './config/local-strategy.config';
import { LOCAL_STRATEGY_NAME } from './constants';

/**
 * Sign controller
 */
@Controller('auth')
export class LocalStrategyController {
  constructor(
    @Inject(ISSUE_TOKEN_SERVICE_TOKEN)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Authenticate using guard
   * @param dto Body
   * @returns
   */
  @UseGuards(AuthGuard(LOCAL_STRATEGY_NAME))
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
