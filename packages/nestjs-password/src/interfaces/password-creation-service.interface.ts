/**
 * Password Creation Service Interface
 */
export interface PasswordCreationServiceInterface {
  /**
   * Check if password is strong
   * @param password
   * @returns
   */
  isStrong(password: string): boolean;

  /**
   * Check if attempt is valid
   * @returns Number of attempts user has to try
   */
  checkAttempt(numOfAttempts: number): boolean;

  /**
   * Check number of attempts of using password
   * @param numOfAttempts number of attempts
   * @returns
   */
  checkAttemptLeft(numOfAttempts: number): number;
}
