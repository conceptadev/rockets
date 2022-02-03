/**
 * Authentication JWT response interface
 */
export interface AuthenticationJwtResponseInterface {
  /**
   * The access token.
   */
  accessToken: string;

  /**
   * The refresh token.
   */
  refreshToken: string;
}
