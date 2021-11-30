import { Test } from '@nestjs/testing';
import { EmailModule } from './email.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { EmailService } from './email.service';
import { emailConfig } from './config/email.config';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';

describe('EmailModule', () => {
  let plainEmailConfig: EmailConfigOptions;

  beforeEach(async () => {
    plainEmailConfig = {
      nodeMailer: {
        transport: {
          host: 'smtp.foo.org',
          port: 587,
          auth: {
            user: '',
            pass: '',
          },
        },
      },
    };
  });

  describe('forRoot', () => {
    it('should import the dynamic module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailModule.forRoot(plainEmailConfig)],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);

      expect(emailService).toBeInstanceOf(EmailService);
    });
  });

  describe('forRootAsync', () => {
    it('should import the dynamic module asynchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          EmailModule.forRootAsync({
            useFactory: async () => {
              return plainEmailConfig;
            },
          }),
        ],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);

      expect(emailService).toBeInstanceOf(EmailService);
    });
  });
});
