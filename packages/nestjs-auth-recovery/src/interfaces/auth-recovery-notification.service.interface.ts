import { EmailSendOptionsInterface } from '@concepta/ts-common';

export interface AuthRecoveryNotificationServiceInterface {
  sendMail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
}
