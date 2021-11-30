import { ConfigModule, ConfigType } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { emailConfig } from './config/email.config';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';

describe('EmailModule', () => {
  const plainEmailConfig: EmailConfigOptions = {
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

  describe('forRoot (plain config)', () => {
    it('should import the dynamic module synchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailModule.forRoot(plainEmailConfig)],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });

  describe('forRoot (default config)', () => {
    it('should import the dynamic module synchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailModule.forRoot()],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });

  describe('forRootAsync (plain)', () => {
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

  describe('forRootAsync (default)', () => {
    it('should import the dynamic module asynchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          EmailModule.forRootAsync({
            imports: [ConfigModule.forFeature(emailConfig)],
            inject: [emailConfig.KEY],
            useFactory: async (config: ConfigType<typeof emailConfig>) => {
              return config;
            },
          }),
        ],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });
});
