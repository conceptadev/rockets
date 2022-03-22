import { ISendMailOptions } from '@nestjs-modules/mailer';

export interface EmailSendOptionsInterface
  extends Pick<
    ISendMailOptions,
    | 'to'
    | 'cc'
    | 'bcc'
    | 'from'
    | 'context'
    | 'subject'
    | 'template'
    | 'icalEvent'
  > {}
