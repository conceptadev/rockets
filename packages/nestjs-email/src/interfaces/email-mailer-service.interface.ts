import { EmailSendOptionsInterface } from './email-send-options.interface';

export interface EmailMailerServiceInterface {
  sendMail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
}
