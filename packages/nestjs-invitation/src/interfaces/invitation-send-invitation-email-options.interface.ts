import { InvitationInterface } from '@concepta/nestjs-common';

export interface InvitationSendInvitationEmailOptionsInterface
  extends Pick<InvitationInterface, 'email' | 'code'> {
  passcode: string;
  resetTokenExp: Date;
}
