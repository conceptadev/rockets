export interface EmailSendOptionsInterface {
  to: string;
  cc: string;
  bcc: string;
  from: string;
  context: string;
  subject: string;
  template: string;
  icalEvent: string;
}
