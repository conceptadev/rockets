import { mock } from 'jest-mock-extended';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { Test } from '@nestjs/testing';
import { EmailMailerServiceInterface } from './interfaces/email-mailer-service.interface';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';

describe('EmailModule', () => {
  const mailerOptions = {
    transport: {
      host: 'smtp.foo.org',
      port: 587,
      auth: {
        user: '',
        pass: '',
      },
    },
  };

  const mailerService: EmailMailerServiceInterface =
    mock<EmailMailerServiceInterface>();

  describe('forRoot (using default mailer)', () => {
    it('should import the dynamic module synchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailModule.register({})],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });

  describe('forRoot (using external mailer)', () => {
    it('should import the dynamic module synchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailModule.register({ mailerService })],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });

  describe('forRootAsync (using imported mailer)', () => {
    it('should import the dynamic module asynchronously', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          EmailModule.registerAsync({
            imports: [MailerModule.forRoot(mailerOptions)],
            inject: [MailerService],
            useFactory: async (mailerService: EmailMailerServiceInterface) => {
              return { mailerService: mailerService };
            },
          }),
        ],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });
});
