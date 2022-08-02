import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OtpInterface, UserInterface } from '@concepta/ts-common';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { OtpService } from '@concepta/nestjs-otp';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { EventDispatchService } from '@concepta/nestjs-event';

import { InvitationService } from './invitation.service';
import { invitationDefaultConfig } from '../config/invitation-default.config';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from '../invitation.constants';
import { InvitationAppModuleFixture } from '../__fixtures__/invitation.app.module.fixture';
import { InvitationUserEntityFixture } from '../__fixtures__/invitation-user-entity.fixture';
import { InvitationFactory } from '../invitation.factory';
import { InvitationEntityFixture } from '../__fixtures__/invitation.entity.fixture';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';

describe('AuthRecoveryService', () => {
  const category = 'invitation';

  let app: INestApplication;
  let seedingSource: SeedingSource;
  let invitationService: InvitationService;
  let testUser: UserEntityInterface;
  let testInvitation: InvitationEntityInterface;
  let otpService: OtpService;
  let configService: ConfigService;
  let config: ConfigType<typeof invitationDefaultConfig>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    invitationService = moduleFixture.get<InvitationService>(InvitationService);
    otpService = moduleFixture.get<OtpService>(OtpService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    config = configService.get<InvitationSettingsInterface>(
      INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN,
    ) as InvitationSettingsInterface;

    jest
      .spyOn(EventDispatchService.prototype, 'async')
      .mockImplementation(async (event) => {
        return Promise.resolve([
          [
            {
              ...(event?.values[0] as object),
              processed: true,
              successfully: true,
              error: null,
            },
          ],
        ]);
      });

    seedingSource = new SeedingSource({
      dataSource: moduleFixture.get(getDataSourceToken()),
    });

    const userFactory = new UserFactory({
      entity: InvitationUserEntityFixture,
      seedingSource,
    });

    const invitationFactory = new InvitationFactory({
      entity: InvitationEntityFixture,
      seedingSource,
    });

    testUser = await userFactory.create();
    testInvitation = await invitationFactory.create({ category });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('Send invitation email', async () => {
    expect(
      await invitationService.sendInvite(
        testUser.id,
        testUser.email,
        randomUUID(),
        'invitation',
      ),
    ).toBeUndefined();
  });

  it('Validate passcode', async () => {
    const otp = await createOtp(config, otpService, testUser, category);

    const validOtp = await invitationService.validatePasscode(
      otp.passcode,
      category,
    );
    expect(validOtp?.assignee).toEqual(testUser);
  });

  it('Validate passcode (invalid)', async () => {
    const invalidOtp = await invitationService.validatePasscode(
      'FAKE_PASSCODE',
      category,
    );

    expect(invalidOtp).toBeNull();
  });

  it('Revoke all users invites', async () => {
    await createOtp(config, otpService, testUser, category);

    expect(
      await invitationService.revokeAllUserInvites(testUser.email, category),
    ).toBeUndefined();
  });

  it('Accept invite and update password', async () => {
    const otp = await createOtp(config, otpService, testUser, category);

    const inviteAccepted = await invitationService.acceptInvite(
      testInvitation,
      otp.passcode,
      {},
    );

    expect(inviteAccepted).toBeTruthy();
  });

  it('Accept invite and update password (fail)', async () => {
    const inviteAccepted = await invitationService.acceptInvite(
      testInvitation,
      'FAKE_PASSCODE',
    );

    expect(inviteAccepted).toBeFalsy();
  });
});

const createOtp = async (
  config: ConfigType<typeof invitationDefaultConfig>,
  otpService: OtpService,
  user: UserInterface,
  category: string,
): Promise<OtpInterface> => {
  const { assignment, type, expiresIn } = config.otp;

  return await otpService.create(assignment, {
    category,
    type,
    expiresIn,
    assignee: {
      id: user.id,
    },
  });
};
