import { Controller, Inject, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
import { AUTH_GOOGLE_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-google.constants';
import { AuthGoogleGuard } from './auth-google.guard';

/**
 * Google controller
 *
 * Flow of how google works:
 *
 * - Client call auth/google/login to be redirected to google login page to require authentication
 * - After authorized by google, the user will be redirected to the callback url defined in the config
 * - The auth/google/callback url will be called with the code as a query parameter
 * - The code will be used to get the access token and user profile from google
 * - The user profile will be used to create a new user or return the existing user from federated module
 * - The user will be authenticated and a token will be issued
 * - The token will be returned to the client
 * - The client can use the token to make requests to the protected resources
 *
 */
@Controller('auth/google')
@UseGuards(AuthGoogleGuard)
@AuthPublic()
@ApiTags('auth')
export class AuthGoogleController {
  constructor(
    @Inject(AUTH_GOOGLE_ISSUE_TOKEN_SERVICE_TOKEN)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Login
   */
  @ApiOkResponse({
    description: 'Users are redirected to request their Google identity.',
  })
  @Get('login')
  login(): void {
    // TODO: no code needed, Decorator will redirect to google
    return;
  }

  @ApiOkResponse({
    type: AuthenticationJwtResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @Get('callback')
  async get(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationResponseInterface> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
