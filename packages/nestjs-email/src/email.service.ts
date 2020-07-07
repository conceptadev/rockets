import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailOptions } from './interfaces/email-options.interface';

@Injectable()
export class EmailService {
  constructor(
    private logger: Logger,
    private readonly mailerService: MailerService
  ) {
    this.logger.setContext(EmailService.name);
  }

  public async sendEmail(dto: EmailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail(dto);
    } catch (e) {
      // log the original error
      this.logger.error(e.message, e.stack);
      // throw a more friendly error
      throw new InternalServerErrorException(
        'Fatal error while trying to send email.'
      );
    }
  }
}
