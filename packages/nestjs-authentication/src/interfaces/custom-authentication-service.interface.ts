import { AccessTokenInterface } from './access-token.interface';
import { AuthenticationResponseInterface } from './authentication-response.interface';
import { AuthenticationStrategyLocalInterface } from './authentication-strategy-local.interface';

/**
 * Sign Service Interface
 */
export interface CustomAuthenticationServiceInterface {
  /**
   * Check if password matches
   * @param localStrategyDto
   * @returns
   */
  authenticate(
    localStrategyDto: AuthenticationStrategyLocalInterface,
  ): Promise<AuthenticationResponseInterface>;

  /**
   * Refresh access token to increase the expiration date
   * @param accessToken
   * @returns
   */
  refreshAccessToken(accessToken: string): Promise<AccessTokenInterface>;
}
