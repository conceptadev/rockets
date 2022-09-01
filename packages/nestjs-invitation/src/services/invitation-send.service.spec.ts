import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';

import { UserEntityInterface } from '@concepta/nestjs-user';
import { EmailService } from '@concepta/nestjs-email';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';

import { INVITATION_MODULE_SETTINGS_TOKEN } from '../invitation.constants';
import { InvitationSendService } from './invitation-send.service';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';

import { InvitationAppModuleFixture } from '../__fixtures__/invitation.app.module.fixture';
import { UserEntityFixture } from '../__fixtures__/entities/user.entity.fixture';
import { UserOtpEntityFixture } from '../__fixtures__/entities/user-otp.entity.fixture';

describe(InvitationSendService, () => {
  let spyEmailService: jest.SpyInstance;

  let app: INestApplication;
  let seedingSource: SeedingSource;
  let settings: InvitationSettingsInterface;
  let userOtpRepo: Repository<UserOtpEntityFixture>;
  let invitationSendService: InvitationSendService;

  let testUser: UserEntityInterface;

  beforeEach(async () => {
    spyEmailService = jest
      .spyOn(EmailService.prototype, 'sendMail')
      .mockImplementation(async () => undefined);

    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();

    settings = testingModule.get<InvitationSettingsInterface>(
      INVITATION_MODULE_SETTINGS_TOKEN,
    );

    userOtpRepo = testingModule.get<Repository<UserOtpEntityFixture>>(
      getDynamicRepositoryToken('user-otp'),
    );

    invitationSendService = testingModule.get<InvitationSendService>(
      InvitationSendService,
    );

    seedingSource = new SeedingSource({
      dataSource: testingModule.get(getDataSourceToken()),
    });

    const userFactory = new UserFactory({
      entity: UserEntityFixture,
      seedingSource,
    });

    testUser = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  describe(InvitationSendService.prototype.send, () => {
    it.only('Should send invitation email', async () => {
      const inviteCode = randomUUID();

      await invitationSendService.send(testUser, inviteCode, 'invitation');

      const otps = await userOtpRepo.find({
        where: { assignee: { id: testUser.id } },
      });

      expect(otps.length).toEqual(1);
      expect(otps[0].category).toEqual('invitation');
      expect(spyEmailService).toHaveBeenCalledTimes(1);

      const { passcode, expirationDate } = otps[0];

      expect(spyEmailService).toHaveBeenCalledWith({
        to: testUser.email,
        from: settings.email.from,
        context: {
          tokenUrl: `${settings.email.baseUrl}/?code=${inviteCode}&passcode=${passcode}`,
          tokenExp: expirationDate,
        },
        subject: settings.email.templates.invitation.subject,
        template: settings.email.templates.invitation.fileName,
      });
    });
  });
});
