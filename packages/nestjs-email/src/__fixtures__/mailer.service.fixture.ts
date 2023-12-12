import { Injectable } from '@nestjs/common';
import {
  EmailSendInterface,
  EmailSendOptionsInterface,
} from '@concepta/ts-common';

@Injectable()
export class MailerServiceFixture implements EmailSendInterface {
  discriminator = 'default';

  sendMail(_sendMailOptions: EmailSendOptionsInterface): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
