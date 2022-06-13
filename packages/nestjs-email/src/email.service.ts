import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { NotAnErrorException } from '@concepta/ts-core';
import { EmailSendOptionsInterface } from './interfaces/email-send-options.interface';
import { EmailMailerServiceInterface } from './interfaces/email-mailer-service.interface';

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
      // determine the exception to log
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      // log the original error
      this.logger.error(exception.message, exception.stack, EmailService.name);
      // throw a more friendly error
      throw new InternalServerErrorException(
        'Fatal error while trying to send email.',
      );
    }
  }
}
