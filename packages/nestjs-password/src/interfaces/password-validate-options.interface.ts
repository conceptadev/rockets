export interface PasswordValidateOptionsInterface {
  /**
   * Plain text password
   */
  password: string;
  /**
   * Hashed password
   */
  passwordHash: string;
  /**
   * Salt used when hashing
   */
  passwordSalt: string;
}
