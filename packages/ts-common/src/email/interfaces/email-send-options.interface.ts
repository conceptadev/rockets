import { Readable } from 'stream';
import { Url } from 'url';

interface Address {
  name: string;
  address: string;
}

interface IcalAttachment {
  method?: string;
  filename?: string | false;
  href?: string;
  encoding?: string;
  content?: string | Buffer | Readable;
  path?: string | Url;
}

export interface EmailSendOptionsInterface {
  to?: string | Address | Array<string | Address>;
  cc?: string | Address | Array<string | Address>;
  bcc?: string | Address | Array<string | Address>;
  from?: string | Address;
  replyTo?: string | Address;
  context?: {
    [name: string]: unknown;
  };
  subject?: string;
  template?: string;
  icalEvent?: string | Buffer | Readable | IcalAttachment;
}
