/**
 * Authentication response interface
 */
export interface AuthenticationResponseInterface {
  /**
   * The access token.
   */
  accessToken: string;

  /**
   * The refresh token.
   */
  refreshToken: string;
}
