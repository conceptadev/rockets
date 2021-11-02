import { Body, Controller, Post } from '@nestjs/common';
import { AccessTokenInterface } from './interfaces/access-token.interface';
import { AuthenticationResponseInterface } from './interfaces/authentication-response.interface';
import { AuthenticationStrategyLocalInterface } from './interfaces/authentication-strategy-local.interface';
import { AuthenticationService } from './services/authentication.service';

/**
 * Sign controller
 */
@Controller('auth')
export class AuthenticationController {
  /**
   * Constructor
   * @param authService
   */
  constructor(private authService: AuthenticationService) {}

  /**
   * Method to authenticate user and return access token
   * @param dto
   * @returns
   */
  @Post()
  async authenticate(
    @Body()
    dto: AuthenticationStrategyLocalInterface,
  ): Promise<AuthenticationResponseInterface> {
    return this.authService.authenticate(dto);
  }

  /**
   * Method to refresh access token
   * @param dto
   * @returns
   */
  @Post()
  async refreshToken(accessToken: string): Promise<AccessTokenInterface> {
    return this.authService.refreshAccessToken(accessToken);
  }
}
