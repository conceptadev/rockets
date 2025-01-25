import {
  AuthenticationJwtResponseDto,
  AuthPublic,
  AuthUser,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
} from '@concepta/nestjs-common';
import { EventDispatchService } from '@concepta/nestjs-event';
import { Controller, Inject, Optional, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AUTH_LOCAL_MODULE_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-local.constants';
import { AuthLocalGuard } from './auth-local.guard';
import { AuthLocalLoginDto } from './dto/auth-local-login.dto';

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
    @Optional()
    @Inject(EventDispatchService)
    private readonly eventDispatchService?: EventDispatchService,
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
    return await this.issueTokenService.responsePayload(user.id);
  }
}
