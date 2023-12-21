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
  AuthUser,
  IssueTokenServiceInterface,
  AuthenticationJwtResponseDto,
  AuthPublic,
} from '@concepta/nestjs-authentication';
import { AUTH_LOCAL_MODULE_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-local.constants';
import { AuthLocalLoginDto } from './dto/auth-local-login.dto';
import { AuthLocalGuard } from './auth-local.guard';

/**
 * Auth Local controller
 */
@Controller('auth/login')
@UseGuards(AuthLocalGuard)
@AuthPublic()
@ApiTags('auth')
export class AuthLocalController {
  constructor(
    @Inject(AUTH_LOCAL_MODULE_ISSUE_TOKEN_SERVICE_TOKEN)
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
  @Post()
  async login(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
