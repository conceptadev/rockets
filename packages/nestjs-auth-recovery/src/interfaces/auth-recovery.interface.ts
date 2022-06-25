export interface AuthRecoveryInterface {
  recoverLogin(email: string): Promise<boolean>;
  recoverPassword(email: string): Promise<void>;
  validatePasscode(passcode: string): Promise<boolean>;
  updatePassword(passcode: string, newPassword: string): Promise<boolean>;
}
