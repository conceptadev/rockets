import { EmailSendOptionsInterface } from './email-send-options.interface';

export interface EmailServiceInterface {
  sendMail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
}
