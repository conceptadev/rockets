import { EmailSendOptionsInterface } from '@concepta/nestjs-common';

export interface AuthRecoveryNotificationServiceInterface {
  sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
  sendRecoverLoginEmail(email: string, username: string): Promise<void>;
  sendRecoverPasswordEmail(
    email: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void>;
  sendPasswordUpdatedSuccessfullyEmail(email: string): Promise<void>;
}
