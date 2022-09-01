import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { OtpService } from '@concepta/nestjs-otp';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';

import { INVITATION_MODULE_INVITATION_ENTITY_KEY } from '../invitation.constants';

import { InvitationFactory } from '../invitation.factory';
import { InvitationSendService } from './invitation-send.service';
import { InvitationRevocationService } from './invitation-revocation.service';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';

import { InvitationAppModuleFixture } from '../__fixtures__/invitation.app.module.fixture';
import { UserEntityFixture } from '../__fixtures__/entities/user.entity.fixture';
import { InvitationEntityFixture } from '../__fixtures__/entities/invitation.entity.fixture';
import { EmailService } from '@concepta/nestjs-email';

describe(InvitationRevocationService, () => {
  const category = 'invitation';

  let spyEmailService: jest.SpyInstance;

  let app: INestApplication;
  let seedingSource: SeedingSource;
  let otpService: OtpService;
  let invitationRepo: Repository<InvitationEntityInterface>;
  let invitationSendService: InvitationSendService;
  let invitationRevocationService: InvitationRevocationService;

  let testUser: UserEntityInterface;
  let invitationFactory: InvitationFactory;

  beforeEach(async () => {
    spyEmailService = jest
      .spyOn(EmailService.prototype, 'sendMail')
      .mockImplementation(async () => undefined);

    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();

    invitationRepo = testingModule.get<Repository<InvitationEntityInterface>>(
      getDynamicRepositoryToken(INVITATION_MODULE_INVITATION_ENTITY_KEY),
    );

    invitationSendService = testingModule.get<InvitationSendService>(
      InvitationSendService,
    );

    invitationRevocationService =
      testingModule.get<InvitationRevocationService>(
        InvitationRevocationService,
      );

    otpService = testingModule.get<OtpService>(OtpService);

    seedingSource = new SeedingSource({
      dataSource: testingModule.get(getDataSourceToken()),
    });

    const userFactory = new UserFactory({
      entity: UserEntityFixture,
      seedingSource,
    });

    invitationFactory = new InvitationFactory({
      entity: InvitationEntityFixture,
      seedingSource,
    });

    testUser = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  describe(InvitationRevocationService.prototype.revokeAll, () => {
    it('Should revoke all user invites', async () => {
      const spyOtpClear = jest.spyOn(otpService, 'clear');

      const invitation = await invitationFactory.create({
        user: testUser,
        email: testUser.email,
        category,
      });

      await invitationSendService.send(
        testUser.id,
        testUser.email,
        invitation.code,
        category,
      );

      const invitations = await invitationRepo.find({
        where: {
          user: { id: testUser.id },
        },
        relations: ['user'],
      });

      expect(invitations.length).toEqual(1);
      expect(invitations[0].user).toEqual(testUser);

      await invitationRevocationService.revokeAll(testUser.email, category);

      const countAfter = await invitationRepo.count();

      expect(countAfter).toEqual(0);
      expect(spyOtpClear).toHaveBeenCalledTimes(1);
      expect(spyEmailService).toHaveBeenCalledTimes(1);
    });
  });
});
