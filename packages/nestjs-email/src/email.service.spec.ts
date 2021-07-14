import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let emailService: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: Logger, useValue: {} },
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

    emailService = moduleRef.get<EmailService>(EmailService);
    mailerService = moduleRef.get<MailerService>(MailerService);
  });

  describe('sendMail', () => {
    describe('when sending an email', () => {
      it('should send email without any errors', async () => {
        jest.spyOn(mailerService, 'sendMail').mockImplementation(async () => {
          return undefined;
        });

        const result = await emailService.sendEmail({});
        expect(result).toBeUndefined();
        expect(mailerService.sendMail).toBeCalledTimes(1);
      });
    });
  });
});
