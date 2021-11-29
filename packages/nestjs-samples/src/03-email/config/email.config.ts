import { registerAs } from '@nestjs/config';
import { EmailConfigOptions } from '@rockts-org/nestjs-email';

export const emailConfig = registerAs(
  'APP_EMAIL_MODULE_CONFIG',
  (): EmailConfigOptions => ({
    nodeMailer: {
      transport: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: '',
          pass: '',
        },
      },
      defaults: {
        from: '',
      },
    },
  }),
);
