import * as bcrypt from 'bcrypt';

/**
 * Abstract class with functions to encapsulate hash methods
 */
export abstract class CryptUtil {
  /**
   * Generate Salt
   * @returns Generate
   */
  static async generateSalt(): Promise<string> {
    return bcrypt.genSalt();
  }

  /**
   * @param password - The plain text password to hash
   * @param salt - The salt to use when hashing the password
   */
  static async hashPassword(password: string, salt: string): Promise<string> {
    // must have a password
    if (password.length && salt.length) {
      return bcrypt.hash(password, salt);
    } else {
      throw new Error(
        'Must have non-zero length password and salt in order to hash.',
      );
    }
  }

  /**
   * Validate password with the hash password
   * @param passwordPlain - The plain password
   * @param passwordHash - The encrypted password
   * @param passwordSalt - The salt
   */
  static async validatePassword(
    passwordPlain: string,
    passwordHash: string,
    passwordSalt: string,
  ): Promise<boolean> {
    const hash = await this.hashPassword(passwordPlain, passwordSalt);
    return hash === passwordHash;
  }
}
