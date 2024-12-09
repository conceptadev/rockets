import {
  LiteralObject,
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { InvitationDto } from '../dto/invitation.dto';

export interface InvitationServiceInterface {
  send(
    user: ReferenceIdInterface & ReferenceEmailInterface,
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
