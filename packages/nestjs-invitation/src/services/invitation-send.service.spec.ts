import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { EmailService } from '@concepta/nestjs-email';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';
import { INVITATION_MODULE_CATEGORY_USER_KEY } from '@concepta/nestjs-common';

import { INVITATION_MODULE_SETTINGS_TOKEN } from '../invitation.constants';
import { InvitationSendService } from './invitation-send.service';
import { InvitationSettingsInterface } from '../interfaces/options/invitation-settings.interface';
import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { UserEntityFixture } from '../__fixtures__/user/entities/user.entity.fixture';
import { UserOtpEntityFixture } from '../__fixtures__/user/entities/user-otp.entity.fixture';
import { RepositoryInterface } from '@concepta/typeorm-common';

describe(InvitationSendService, () => {
  let spyEmailService: jest.SpyInstance;

  let app: INestApplication;
  let seedingSource: SeedingSource;
  let settings: InvitationSettingsInterface;
  let userOtpRepo: RepositoryInterface<UserOtpEntityFixture>;
  let invitationSendService: InvitationSendService;

  let testUser: UserEntityInterface;

  beforeEach(async () => {
    spyEmailService = jest
      .spyOn(EmailService.prototype, 'sendMail')
      .mockImplementation(async () => undefined);

    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();

    settings = testingModule.get<InvitationSettingsInterface>(
      INVITATION_MODULE_SETTINGS_TOKEN,
    );

    userOtpRepo = testingModule.get<RepositoryInterface<UserOtpEntityFixture>>(
      getDynamicRepositoryToken('user-otp'),
    );

    invitationSendService = testingModule.get<InvitationSendService>(
      InvitationSendService,
    );

    seedingSource = new SeedingSource({
      dataSource: testingModule.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    const userFactory = new UserFactory({
      entity: UserEntityFixture,
      seedingSource,
    });

    testUser = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    app && (await app.close());
  });

  describe(InvitationSendService.prototype.send, () => {
    it('Should send invitation email', async () => {
      const inviteCode = randomUUID();

      await invitationSendService.send({
        id: 'abcdefg',
        user: testUser,
        code: inviteCode,
        category: INVITATION_MODULE_CATEGORY_USER_KEY,
      });

      const otps = await userOtpRepo.find({
        where: { assignee: { id: testUser.id } },
      });

      expect(otps.length).toEqual(1);
      expect(otps[0].category).toEqual(INVITATION_MODULE_CATEGORY_USER_KEY);
      expect(spyEmailService).toHaveBeenCalledTimes(1);

      const { passcode, expirationDate } = otps[0];

      expect(spyEmailService).toHaveBeenCalledWith({
        to: testUser.email,
        from: settings.email.from,
        context: {
          logo: `${settings.email.baseUrl}/${settings.email.templates.invitation.logo}`,
          tokenUrl: `${settings.email.baseUrl}/?code=${inviteCode}&passcode=${passcode}`,
          tokenExp: expirationDate,
        },
        subject: settings.email.templates.invitation.subject,
        template: settings.email.templates.invitation.fileName,
      });
    });
  });
});
