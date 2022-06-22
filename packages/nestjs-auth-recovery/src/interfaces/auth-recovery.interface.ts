export interface AuthRecoveryInterface {
  recoverLogin(email: string): Promise<boolean>;
  recoverPassword(email: string): Promise<boolean>;
  validatePasscode(passcode: string): Promise<boolean>;
  updatePassword(passcode: string, newPassword: string): Promise<boolean>;
}
