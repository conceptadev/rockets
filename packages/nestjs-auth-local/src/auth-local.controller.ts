import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  AuthenticationJwtResponseInterface,
  AuthUser,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import { AuthGuard } from '@concepta/nestjs-authentication';
import { AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-local.constants';
import { AUTH_LOCAL_STRATEGY_NAME } from './auth-local.constants';
import { IdentityInterface } from '@concepta/nestjs-common';

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
    @AuthUser() user: IdentityInterface,
  ): Promise<AuthenticationJwtResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
