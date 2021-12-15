import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  AuthUser,
  CredentialLookupInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { ISSUE_TOKEN_SERVICE_TOKEN } from './config/local.config';
import { LocalAuthGuard } from './local-auth.guard';

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
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async authenticateWithGuard(
    @AuthUser() user: CredentialLookupInterface,
  ): Promise<AuthenticationResponseInterface> {
    const token = this.issueTokenService.issueAccessToken(user.username);

    return {
      ...user,
      ...token,
    } as AuthenticationResponseInterface;
  }
}
