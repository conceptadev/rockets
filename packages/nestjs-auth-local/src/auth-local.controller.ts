import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  AuthenticationResponseInterface,
  AuthUser,
  CredentialLookupInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { AuthGuard } from '@rockts-org/nestjs-authentication';
import { AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-local.constants';
import { AUTH_LOCAL_STRATEGY_NAME } from './auth-local.constants';

/**
 * Sign controller
 */
@Controller('auth')
export class AuthLocalController {
  constructor(
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
    return this.issueTokenService.responsePayload(user.id);
  }
}
