import { EmailSendOptionsInterface } from './email-send-options.interface';

export interface EmailServiceInterface {
  sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
}
