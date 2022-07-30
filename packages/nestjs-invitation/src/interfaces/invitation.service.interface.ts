import { LiteralObject, ReferenceAssigneeInterface } from '@concepta/ts-core';
import { InvitationDto } from '../dto/invitation.dto';

export interface InvitationServiceInterface {
  sendInvite(
    userId: string,
    email: string,
    code: string,
    category: string,
  ): Promise<void>;
  validatePasscode(
    passcode: string,
    category: string,
    deleteIfValid: boolean,
  ): Promise<ReferenceAssigneeInterface | null>;
  acceptInvite(
    invitationDto: InvitationDto,
    passcode: string,
    payload?: LiteralObject,
  ): Promise<boolean>;
  revokeAllUserInvites(email: string, category: string): Promise<void>;
}
