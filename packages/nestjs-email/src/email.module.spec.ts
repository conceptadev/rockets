import { Test, TestingModule } from '@nestjs/testing';
import { emailConfig } from './config/email.config';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';
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
    let moduleRef: TestingModule;

    beforeEach(async () => {
      jest.clearAllMocks();

      const config = await emailConfig();

      moduleRef = await Test.createTestingModule({
        imports: [EmailModule.forRoot({ ...config })],
      }).compile();
    });

    it('module should be defined', async () => {
      expect(moduleRef).toBeInstanceOf(TestingModule);
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
