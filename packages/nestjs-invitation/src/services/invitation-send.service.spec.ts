import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { InvitationSendService } from './invitation-send.service';

import { InvitationAppModuleFixture } from '../__fixtures__/invitation.app.module.fixture';
import { UserEntityFixture } from '../__fixtures__/entities/user.entity.fixture';

describe(InvitationSendService, () => {
  let app: INestApplication;
  let seedingSource: SeedingSource;
  let invitationSendService: InvitationSendService;

  let testUser: UserEntityInterface;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();

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
    it('Should send invitation email', async () => {
      expect(
        await invitationSendService.send(
          testUser.id,
          testUser.email,
          randomUUID(),
          'invitation',
        ),
      ).toBeUndefined();
    });
  });
});
