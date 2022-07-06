import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AuthRecoveryAppModuleFixture } from '../__fixtures__/auth-recovery.app.module.fixture';
import { AuthRecoveryNotificationService } from './auth-recovery-notification.service';

describe('AuthRecoveryNotificationService', () => {
  let app: INestApplication;
  let authRecoveryNotificationService: AuthRecoveryNotificationService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthRecoveryAppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

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
  });

  it('Send recover email login', async () => {
    await authRecoveryNotificationService.sendRecoverLoginEmail(
      'me@mail.com',
      'me',
    );
  });

  it('Send recover email password', async () => {
    await authRecoveryNotificationService.sendRecoverPasswordEmail(
      'me@mail.com',
      'me',
      new Date(),
    );
  });
});
