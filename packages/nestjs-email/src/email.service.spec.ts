import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let logger: Logger;
  let emailService: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: Logger, useValue: { error: jest.fn() } },
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

    logger = moduleRef.get<Logger>(Logger);
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

    it('should send email with caught error', async () => {
      expect.hasAssertions();

      jest.spyOn(mailerService, 'sendMail').mockImplementation(async () => {
        throw new Error('Dummy error');
      });

      try {
        await emailService.sendEmail({});
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Fatal error while trying to send email.');
      }

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(logger.error).toBeCalledTimes(1);
    });
  });
});
