import { Injectable } from '@nestjs/common';
import {
  EmailSendInterface,
  EmailSendOptionsInterface,
} from '@concepta/ts-common';

@Injectable()
export class MailerServiceFixture implements EmailSendInterface {
  sendMail(
    sendMailOptions: EmailSendOptionsInterface, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
