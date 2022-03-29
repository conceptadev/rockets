import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  AuthUser,
  AuthenticationJwtResponseInterface,
  IssueTokenServiceInterface,
  AuthenticatedUserInterface,
} from '@concepta/nestjs-authentication';
import { AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-local.constants';
import { AUTH_LOCAL_STRATEGY_NAME } from './auth-local.constants';

/**
 * Auth Local controller
 */
@Controller('auth/local')
export class AuthLocalController {
  constructor(
    @Inject(AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Login
   */
  @UseGuards(AuthGuard(AUTH_LOCAL_STRATEGY_NAME))
  @Post()
  async login(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationJwtResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
