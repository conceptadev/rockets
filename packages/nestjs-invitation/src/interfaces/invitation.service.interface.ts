import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface InvitationServiceInterface {
  sendInvite(email: string): Promise<void>;
  validatePasscode(
    passcode: string,
    deleteIfValid: boolean,
  ): Promise<ReferenceAssigneeInterface | null>;
  acceptInvite(
    passcode: string,
    newPassword: string,
  ): Promise<ReferenceIdInterface | null>;
  revokeAllUserInvites(email: string): Promise<void>;
}
