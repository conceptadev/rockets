import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EmailSendOptionsInterface } from './interfaces/email-send-options.interface';
import { EmailMailerServiceInterface } from './interfaces/email-mailer-service.interface';
import { NotAnErrorException } from '@concepta/ts-core';

@Injectable()
export class EmailService {
  constructor(
    private logger: Logger,
    @Inject('EMAIL_MODULE_MAILER_SERVICE_TOKEN')
    private readonly mailerService: EmailMailerServiceInterface,
  ) {}

  public async sendEmail(dto: EmailSendOptionsInterface): Promise<void> {
    try {
      await this.mailerService.sendMail(dto);
    } catch (e) {
      if (e instanceof Error === false) {
        e = new NotAnErrorException(e);
      }
      // log the original error
      this.logger.error(e.message, e.stack, EmailService.name);
      // throw a more friendly error
      throw new InternalServerErrorException(
        'Fatal error while trying to send email.',
      );
    }
  }
}
