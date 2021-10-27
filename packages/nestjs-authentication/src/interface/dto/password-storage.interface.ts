/**
 * Authentication module configuration options interface
 */
export interface PasswordStorageInterface {
  /**
   * Password
   */
  password?: string;

  /**
   * salt to encrypt password
   */
  salt?: string;
}
