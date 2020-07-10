import { MailerOptions } from '@nestjs-modules/mailer';

export interface EmailModuleOptions {
  nodeMailer: MailerOptions;
}
