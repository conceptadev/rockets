import { EmailSendOptionsInterface } from '@concepta/ts-common';

export interface InvitationNotificationServiceInterface {
  sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
  sendInviteEmail(
    email: string,
    passcode: string,
    code: string,
    resetTokenExp: Date,
  ): Promise<void>;
  sendInviteAcceptedEmail(email: string): Promise<void>;
}
