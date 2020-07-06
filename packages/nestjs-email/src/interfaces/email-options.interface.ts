import { ISendMailOptions } from '@nestjs-modules/mailer';

export interface EmailOptions
  extends Pick<
    ISendMailOptions,
    'to' | 'cc' | 'bcc' | 'from' | 'context' | 'subject' | 'template'
  > {}
