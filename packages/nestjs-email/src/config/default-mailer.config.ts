import { MailerOptions } from '@nestjs-modules/mailer';
import { registerAs } from '@nestjs/config';

/**
 * Get email config from environment variables.
 */
export const defaultMailerConfig = registerAs(
  'EMAIL_MODULE_DEFAULT_MAILER_CONFIG',
  (): MailerOptions => ({
    transport: {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
    defaults: {
      from: process.env.EMAIL_FROM,
    },
  }),
);
