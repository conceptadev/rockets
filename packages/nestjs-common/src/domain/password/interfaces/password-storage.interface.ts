/**
 * Password storage interface
 */
export interface PasswordStorageInterface {
  /**
   * Hashed password
   */
  passwordHash: string;

  /**
   * Salt used to hash password
   */
  passwordSalt: string;
}
