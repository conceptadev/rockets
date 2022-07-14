import { EmailSendOptionsInterface } from '@concepta/ts-common';

export interface InvitationNotificationServiceInterface {
  sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
  sendInviteEmail(
    email: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void>;
}
