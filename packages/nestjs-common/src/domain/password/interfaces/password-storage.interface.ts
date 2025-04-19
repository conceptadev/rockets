/**
 * Password storage interface
 */
export interface PasswordStorageInterface {
  /**
   * Hashed password
   */
  passwordHash: string | null;

  /**
   * Salt used to hash password
   */
  passwordSalt: string | null;
}
