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
   *
   * @param password Hash password
   * @param salt
   * @returns
   */
  static async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  /**
   * Validate password with the hash password
   * @param passwordPlain
   * @param passwordCrypt
   * @param salt
   * @returns
   */
  static async validatePassword(
    passwordPlain: string,
    passwordCrypt: string,
    salt: string,
  ): Promise<boolean> {
    const hash = await this.hashPassword(passwordPlain, salt);
    return hash === passwordCrypt;
  }
}
