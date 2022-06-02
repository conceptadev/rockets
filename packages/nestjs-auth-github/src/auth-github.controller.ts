import { Controller, Inject, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthUser,
  IssueTokenServiceInterface,
  AuthenticatedUserInterface,
  AuthenticationJwtResponseDto,
} from '@concepta/nestjs-authentication';
import { AUTH_GITHUB_ISSUE_TOKEN_SERVICE_TOKEN } from './auth-github.constants';
import { AUTH_GITHUB_STRATEGY_NAME } from './auth-github.constants';

// TODO: improve documentation
/**
 * Github controller
 *
 * Flow of how github works:
 *
 * - Client call auth/github/login to be redirected to github login page to require authentication
 * - After authorized by github, the user will be redirected to the callback url defined in the config
 * - The auth/github/callback url will be called with the code as a query parameter
 * - The code will be used to get the access token and user profile from github
 * - The user profile will be used to create a new user or return the existing user from federated module
 * - The user will be authenticated and a token will be issued
 * - The token will be returned to the client
 * - The client can use the token to make requests to the protected resources
 *
 */
@Controller('auth/github')
@ApiTags('auth')
export class AuthGithubController {
  constructor(
    @Inject(AUTH_GITHUB_ISSUE_TOKEN_SERVICE_TOKEN)
    private issueTokenService: IssueTokenServiceInterface,
  ) {}

  /**
   * Login
   */
  @ApiOkResponse({
    description: 'Users are redirected to request their GitHub identity.',
  })
  @UseGuards(AuthGuard(AUTH_GITHUB_STRATEGY_NAME))
  @Get('login')
  login(): void {
    // TODO: no code needed, Decorator will redirect to github
    return;
  }

  // TODO: Check  why post does not work for a callback
  @ApiOkResponse({
    type: AuthenticationJwtResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @UseGuards(AuthGuard(AUTH_GITHUB_STRATEGY_NAME))
  @Get('callback')
  async get(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticationJwtResponseDto> {
    return this.issueTokenService.responsePayload(user.id);
  }
}
