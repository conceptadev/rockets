/**
  Minimal email send contract used by rockets-auth notification services.
  Owned here so we do not depend on `@concepta/nestjs-common` (Scenario B:
  email package stays on v7 until Concepta publishes a v8 email surface).
 */
type EmailAddress =
  | string
  | { readonly name: string; readonly address: string };
type EmailRecipient = EmailAddress | EmailAddress[];

export interface EmailSendOptionsInterface {
  readonly to?: EmailRecipient;
  readonly cc?: EmailRecipient;
  readonly bcc?: EmailRecipient;
  readonly from?: EmailAddress;
  readonly replyTo?: EmailAddress;
  readonly context?: Record<string, unknown>;
  readonly subject?: string;
  readonly template?: string;
}

export interface EmailSendInterface {
  sendMail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
}
