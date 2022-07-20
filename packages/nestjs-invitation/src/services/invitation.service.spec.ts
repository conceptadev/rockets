import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Seeding } from '@concepta/typeorm-seeding';
import { OtpInterface, UserInterface } from '@concepta/ts-common';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { OtpService } from '@concepta/nestjs-otp';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';

import { InvitationService } from './invitation.service';
import { invitationDefaultConfig } from '../config/invitation-default.config';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from '../invitation.constants';

import { InvitationAppModuleFixture } from '../__fixtures__/invitation.app.module.fixture';
import { InvitationUserEntityFixture } from '../__fixtures__/invitation-user-entity.fixture';

describe('AuthRecoveryService', () => {
  let app: INestApplication;
  let invitationService: InvitationService;
  let testUser: UserEntityInterface;
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

    Seeding.configure({
      dataSource: moduleFixture.get(getDataSourceToken()),
    });

    const userFactory = new UserFactory({
      entity: InvitationUserEntityFixture,
    });

    testUser = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('Send invitation email', async () => {
    expect(await invitationService.sendInvite(testUser.email)).toBeUndefined();
  });

  it('Validate passcode', async () => {
    const otp = await createOtp(config, otpService, testUser);

    const validOtp = await invitationService.validatePasscode(otp.passcode);
    expect(validOtp?.assignee).toEqual(testUser);
  });

  it('Validate passcode (invalid)', async () => {
    const invalidOtp = await invitationService.validatePasscode(
      'FAKE_PASSCODE',
    );

    expect(invalidOtp).toBeNull();
  });

  it('Revoke all users invites', async () => {
    await createOtp(config, otpService, testUser);

    expect(
      await invitationService.revokeAllUserInvites(testUser.email),
    ).toBeUndefined();
  });

  it('Accept invite and update password', async () => {
    const otp = await createOtp(config, otpService, testUser);

    const user = await invitationService.acceptInvite(
      otp.passcode,
      '$!Abc123bsksl6764579',
    );

    expect(user?.id).toEqual(testUser.id);
  });

  it('Accept invite and update password (fail)', async () => {
    const user = await invitationService.acceptInvite(
      'FAKE_PASSCODE',
      '$!Abc123bsksl6764579',
    );

    expect(user).toBeNull();
  });
});

const createOtp = async (
  config: ConfigType<typeof invitationDefaultConfig>,
  otpService: OtpService,
  user: UserInterface,
): Promise<OtpInterface> => {
  const { category, assignment, type, expiresIn } = config.otp;

  return await otpService.create(assignment, {
    category,
    type,
    expiresIn,
    assignee: {
      id: user.id,
    },
  });
};
