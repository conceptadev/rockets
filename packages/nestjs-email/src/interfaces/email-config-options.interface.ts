import { MailerOptions } from '@nestjs-modules/mailer';

export interface EmailConfigOptions {
  nodeMailer: MailerOptions;
}
