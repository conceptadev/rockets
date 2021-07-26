import { Test } from '@nestjs/testing';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';

describe('EmailModule', () => {
  let emailConfig: EmailConfigOptions;

  beforeEach(async () => {
    emailConfig = {
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
        imports: [EmailModule.forRoot(emailConfig)],
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
              return emailConfig;
            },
          }),
        ],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);

      expect(emailService).toBeInstanceOf(EmailService);
    });
  });
});
