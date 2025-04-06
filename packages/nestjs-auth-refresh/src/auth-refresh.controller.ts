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
} from '@concepta/nestjs-common';
import {
  IssueTokenServiceInterface,
  AuthUser,
  AuthenticationJwtResponseDto,
  AuthPublic,
} from '@concepta/nestjs-authentication';
import { AuthRefreshIssueTokenService } from './auth-refresh.constants';
import { AuthRefreshDto } from './dto/auth-refresh.dto';
import { AuthRefreshGuard } from './auth-refresh.guard';

/**
 * Auth Local controller
 */
@Controller('token/refresh')
@UseGuards(AuthRefreshGuard)
@AuthPublic()
@ApiTags('auth')
export class AuthRefreshController {
  constructor(
    @Inject(AuthRefreshIssueTokenService)
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
  @Post()
  async refresh(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
