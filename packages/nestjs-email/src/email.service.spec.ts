import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EMAIL_MODULE_MAILER_SERVICE_TOKEN } from './email.constants';
import { EmailMailerServiceInterface } from './interfaces/email-mailer-service.interface';
import { mock } from 'jest-mock-extended';

describe('EmailService', () => {
  let logger: Logger;
  let emailService: EmailService;
  let mailerService: EmailMailerServiceInterface;

  beforeEach(async () => {
    mailerService = mock<EmailMailerServiceInterface>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: Logger, useValue: { error: jest.fn() } },
        {
          provide: EMAIL_MODULE_MAILER_SERVICE_TOKEN,
          useValue: mailerService,
        },
      ],
    }).compile();

    logger = moduleRef.get<Logger>(Logger);
    emailService = moduleRef.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        if (!(e instanceof Error)) {
          throw new Error('Caught an exception that is not an Error object');
        }
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Fatal error while trying to send email.');
      }

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(logger.error).toBeCalledTimes(1);
    });
  });
});
