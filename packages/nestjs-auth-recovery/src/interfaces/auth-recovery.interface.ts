import { ReferenceAssigneeInterface } from '@concepta/ts-core';

export interface AuthRecoveryInterface {
  recoverLogin(email: string): Promise<boolean>;
  recoverPassword(email: string): Promise<void>;
  validatePasscode(
    passcode: string,
  ): Promise<ReferenceAssigneeInterface | null>;
  updatePassword(passcode: string, newPassword: string): Promise<boolean>;
}
