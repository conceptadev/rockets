import {
  registerAs,
  ConfigFactory,
  ConfigFactoryKeyHost,
} from '@nestjs/config';
import { EmailConfigOptions } from '../interfaces/email-config-options.interface';

/**
 * The token to which all email module options are set.
 */
export const EMAIL_MODULE_OPTIONS_TOKEN = 'EMAIL_MODULE_OPTIONS_TOKEN';

/**
 * Email config factory type.
 */
export type EmailConfigFactory = ConfigFactory<EmailConfigOptions> &
  ConfigFactoryKeyHost;

/**
 * Get email config from environment variables.
 */
export const emailConfig: EmailConfigFactory = registerAs(
  'EMAIL_MODULE_CONFIG',
  (): EmailConfigOptions => ({
    nodeMailer: {
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
    },
  }),
);
