import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EmailService } from '@concepta/nestjs-email';

import { AuthRecoveryEmailService } from '../auth-recovery.constants';
import { AuthRecoveryNotificationService } from './auth-recovery-notification.service';

import { AppModuleFixture } from '../__fixtures__/app.module.fixture';

describe('AuthRecoveryNotificationService', () => {
  let app: INestApplication;
  let emailService: EmailService;
  let authRecoveryNotificationService: AuthRecoveryNotificationService;

  let spyEmailService: jest.SpyInstance;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    emailService = moduleFixture.get<EmailService>(AuthRecoveryEmailService);

    spyEmailService = jest
      .spyOn(emailService, 'sendMail')
      .mockResolvedValue(undefined);

    authRecoveryNotificationService =
      moduleFixture.get<AuthRecoveryNotificationService>(
        AuthRecoveryNotificationService,
      );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('Send email', async () => {
    await authRecoveryNotificationService.sendEmail({});
    expect(spyEmailService).toHaveBeenCalledTimes(1);
  });

  it('Send recover email login', async () => {
    await authRecoveryNotificationService.sendRecoverLoginEmail(
      'me@mail.com',
      'me',
    );
    expect(spyEmailService).toHaveBeenCalledTimes(1);
  });

  it('Send recover email password', async () => {
    await authRecoveryNotificationService.sendRecoverPasswordEmail(
      'me@mail.com',
      'me',
      new Date(),
    );
    expect(spyEmailService).toHaveBeenCalledTimes(1);
  });

  it('Send recover email password', async () => {
    authRecoveryNotificationService['settings'].email.tokenUrlFormatter =
      undefined;

    await authRecoveryNotificationService.sendRecoverPasswordEmail(
      'me@mail.com',
      'me',
      new Date(),
    );
    expect(spyEmailService).toHaveBeenCalledTimes(1);
  });

  it('Send recover email password', async () => {
    await authRecoveryNotificationService.sendPasswordUpdatedSuccessfullyEmail(
      'me@mail.com',
    );
    expect(emailService.sendMail).toHaveBeenCalled();
  });
});
