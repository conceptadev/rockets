import { ConfigModule, ConfigType, registerAs } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';

describe('EmailModule', () => {
  let emailConfigPlain: EmailConfigOptions;

  beforeEach(async () => {
    emailConfigPlain = {
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
        imports: [EmailModule.forRoot(emailConfigPlain)],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);

      expect(emailService).toBeInstanceOf(EmailService);
    });
  });

  describe('forRootAsync', () => {
    it('should import the dynamic module asynchronously', async () => {
      const emailConfig = registerAs(
        'EMAIL_CONFIG_KEY',
        (): EmailConfigOptions => emailConfigPlain,
      );

      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [emailConfig],
          }),
          EmailModule.forRootAsync({
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
