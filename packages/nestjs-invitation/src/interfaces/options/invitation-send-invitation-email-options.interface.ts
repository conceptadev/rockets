import {
  InvitationInterface,
  ReferenceEmailInterface,
} from '@concepta/nestjs-common';

export interface InvitationSendInvitationEmailOptionsInterface
  extends Pick<InvitationInterface, 'code'>,
    ReferenceEmailInterface {
  passcode: string;
  resetTokenExp: Date;
}
