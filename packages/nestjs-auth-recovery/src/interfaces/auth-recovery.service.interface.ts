import {
  AssigneeRelationInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface AuthRecoveryServiceInterface {
  recoverLogin(email: string): Promise<void>;
  recoverPassword(email: string): Promise<void>;
  validatePasscode(
    passcode: string,
    deleteIfValid?: boolean,
  ): Promise<AssigneeRelationInterface | null>;
  updatePassword(
    passcode: string,
    newPassword: string,
  ): Promise<ReferenceIdInterface | null>;
  revokeAllUserPasswordRecoveries(email: string): Promise<void>;
}
