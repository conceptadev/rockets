import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthGuard,
  AuthUser,
  IssueTokenServiceInterface,
  AuthenticatedUserInterface,
  AuthenticationJwtResponseDto,
} from '@concepta/nestjs-authentication';
import { AUTH_LOCAL_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-local.constants';
import { AUTH_LOCAL_STRATEGY_NAME } from './auth-local.constants';
import { AuthLocalLoginDto } from './dto/auth-local-login.dto';

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
  @ApiBody({
    type: AuthLocalLoginDto,
    description: 'DTO containing username and password.',
  })
  @ApiOkResponse({
    type: AuthenticationJwtResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @ApiUnauthorizedResponse()
  @UseGuards(AuthGuard(AUTH_LOCAL_STRATEGY_NAME))
  @Post()
  async login(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationJwtResponseDto> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
