import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

export interface EmailModuleAsyncOptions {
  nodeMailer: MailerAsyncOptions;
}
