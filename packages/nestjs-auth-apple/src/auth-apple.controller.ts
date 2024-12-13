import { Controller, Inject, Get, UseGuards, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
} from '@concepta/nestjs-common';
import {
  AuthUser,
  IssueTokenServiceInterface,
  AuthenticationJwtResponseDto,
  AuthPublic,
} from '@concepta/nestjs-authentication';
import { AUTH_APPLE_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-apple.constants';
import { AuthAppleGuard } from './auth-apple.guard';

/**
 * Apple controller
 *
 * Flow of how apple works:
 *
 * - Client call auth/apple/login to be redirected to apple login page to require authentication
 * - After authorized by apple, the user will be redirected to the callback url defined in the config
 * - The auth/apple/callback url will be called with the code as a query parameter
 * - The code will be used to get the access token and user profile from apple
 * - The user profile will be used to create a new user or return the existing user from federated module
 * - The user will be authenticated and a token will be issued
 * - The token will be returned to the client
 * - The client can use the token to make requests to the protected resources
 *
 */
@Controller('auth/apple')
@UseGuards(AuthAppleGuard)
@AuthPublic()
@ApiTags('auth')
export class AuthAppleController {
  constructor(
    @Inject(AUTH_APPLE_ISSUE_TOKEN_SERVICE_TOKEN)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Login
   */
  @ApiOkResponse({
    description: 'Users are redirected to request their Apple identity.',
  })
  @Get('login')
  login(): void {
    // TODO: no code needed, Decorator will redirect to apple
    return;
  }

  @ApiOkResponse({
    type: AuthenticationJwtResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @Post('callback')
  async post(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
