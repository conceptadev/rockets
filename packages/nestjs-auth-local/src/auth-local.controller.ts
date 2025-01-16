import {
  AuthenticationJwtResponseDto,
  AuthPublic,
  AuthUser,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
  AuthenticatedEventInterface,
  AuthInfo,
  AuthenticatedUserInfoInterface,
} from '@concepta/nestjs-common';
import { EventDispatchService } from '@concepta/nestjs-event';
import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AUTH_LOCAL_AUTHENTICATION_TYPE,
  AUTH_LOCAL_MODULE_ISSUE_TOKEN_SERVICE_TOKEN,
} from './auth-local.constants';
import { AuthLocalGuard } from './auth-local.guard';
import { AuthLocalLoginDto } from './dto/auth-local-login.dto';
import { AuthLocalAuthenticatedEventAsync } from './events/auth-local-authenticated.event';

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
    private readonly eventDispatchService: EventDispatchService,
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
    @AuthInfo() authInfo: AuthenticatedUserInfoInterface,
  ): Promise<AuthenticationResponseInterface> {
    const response = await this.issueTokenService.responsePayload(user.id);

    await this.dispatchAuthenticatedEvent({
      userInfo: {
        userId: user.id,
        ipAddress: authInfo?.ipAddress || '',
        deviceInfo: authInfo?.deviceInfo || '',
        authType: AUTH_LOCAL_AUTHENTICATION_TYPE,
      },
    });

    return response;
  }

  protected async dispatchAuthenticatedEvent(
    payload?: AuthenticatedEventInterface,
  ): Promise<boolean> {
    const authenticatedEventAsync = new AuthLocalAuthenticatedEventAsync(
      payload,
    );

    const eventResult = await this.eventDispatchService.async(
      authenticatedEventAsync,
    );

    return eventResult.every((it) => it === true);
  }
}
