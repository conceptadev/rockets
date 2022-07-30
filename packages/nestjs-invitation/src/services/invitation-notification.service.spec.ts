import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { InvitationAppModuleFixture } from '../__fixtures__/invitation.app.module.fixture';
import { InvitationNotificationService } from './invitation-notification.service';

describe('AuthRecoveryNotificationService', () => {
  let app: INestApplication;
  let authRecoveryNotificationService: InvitationNotificationService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    authRecoveryNotificationService =
      moduleFixture.get<InvitationNotificationService>(
        InvitationNotificationService,
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
    await authRecoveryNotificationService.sendInviteEmail(
      'me@mail.com',
      randomUUID(),
      'passcode',
      new Date(),
    );
  });
});
