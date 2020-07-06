import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailOptions } from './interfaces/email-options.interface';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(dto: EmailOptions): Promise<void> {
    await this.mailerService.sendMail(dto);
  }
}
