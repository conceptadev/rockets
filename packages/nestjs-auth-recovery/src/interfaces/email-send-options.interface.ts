export interface EmailSendOptionsInterface {
  to?: string;
  cc?: string;
  bcc?: string;
  from?: string;
  context?: {
    [name: string]: never;
  };
  subject?: string;
  template?: string;
  icalEvent?: string;
}
