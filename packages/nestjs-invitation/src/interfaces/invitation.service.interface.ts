import { LiteralObject } from '@concepta/ts-core';
import { InvitationDto } from '../dto/invitation.dto';

export interface InvitationServiceInterface {
  send(
    userId: string,
    email: string,
    code: string,
    category: string,
  ): Promise<void>;

  accept(
    invitationDto: InvitationDto,
    passcode: string,
    payload?: LiteralObject,
  ): Promise<boolean>;

  revokeAll(email: string, category: string): Promise<void>;
}
