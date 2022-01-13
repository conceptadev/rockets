/**
 * Interface for access token
 */
export interface AccessTokenInterface {
  [key: string]: unknown;

  /**
   * Access token
   */
  accessToken: string;

  /**
   * Expiration date for access token
   */
  expireIn: Date;
}
