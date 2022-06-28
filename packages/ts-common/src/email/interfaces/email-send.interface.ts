import { EmailSendOptionsInterface } from './email-send-options.interface';

export interface EmailSendInterface {
  sendMail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
}
