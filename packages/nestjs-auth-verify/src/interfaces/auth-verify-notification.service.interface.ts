import { EmailSendOptionsInterface } from '@concepta/nestjs-common';

export interface AuthVerifyNotificationServiceInterface {
  sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
  sendVerifyEmail(
    email: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void>;
}
