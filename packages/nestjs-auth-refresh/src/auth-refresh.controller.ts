import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
} from '@concepta/ts-common';
import {
  IssueTokenServiceInterface,
  IssueTokenService,
  AuthGuard,
  AuthUser,
  AuthenticationJwtResponseDto,
} from '@concepta/nestjs-authentication';
import { AUTH_JWT_REFRESH_STRATEGY_NAME } from './auth-refresh.constants';
import { AuthRefreshDto } from './dto/auth-refresh.dto';

/**
 * Auth Local controller
 */
@Controller('token/refresh')
@ApiTags('auth')
export class AuthRefreshController {
  constructor(
    @Inject(IssueTokenService)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Login
   */
  @ApiBody({
    type: AuthRefreshDto,
    description: 'DTO containing a refresh token.',
  })
  @ApiOkResponse({
    type: AuthenticationJwtResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @ApiUnauthorizedResponse()
  @UseGuards(AuthGuard(AUTH_JWT_REFRESH_STRATEGY_NAME))
  @Post()
  async refresh(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
