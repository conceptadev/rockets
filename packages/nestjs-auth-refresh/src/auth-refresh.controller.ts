import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  IssueTokenServiceInterface,
  IssueTokenService,
  AuthenticationJwtResponseInterface,
  AuthGuard,
  AuthUser,
  UserIdentityDto,
} from '@rockts-org/nestjs-authentication';
import { AUTH_JWT_REFRESH_STRATEGY_NAME } from './auth-refresh.constants';

/**
 * Auth Local controller
 */
@Controller('token/refresh')
export class AuthRefreshController {
  constructor(
    @Inject(IssueTokenService)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Login
   */
  @UseGuards(AuthGuard(AUTH_JWT_REFRESH_STRATEGY_NAME))
  @Post()
  async refresh(
    @AuthUser() user: UserIdentityDto,
  ): Promise<AuthenticationJwtResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
