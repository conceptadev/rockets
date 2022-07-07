import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Seeding } from '@concepta/typeorm-seeding';
import { OtpInterface, UserInterface } from '@concepta/ts-common';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { OtpService } from '@concepta/nestjs-otp';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';

import { AuthRecoveryService } from './auth-recovery.service';
import { authRecoveryDefaultConfig } from '../config/auth-recovery-default.config';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';
import { AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-recovery.constants';

import { AuthRecoveryAppModuleFixture } from '../__fixtures__/auth-recovery.app.module.fixture';
import { AuthRecoveryUserEntityFixture } from '../__fixtures__/auth-recovery-user-entity.fixture';

describe('AuthRecoveryService', () => {
  let app: INestApplication;
  let authRecoveryService: AuthRecoveryService;
  let testUser: UserEntityInterface;
  let otpService: OtpService;
  let configService: ConfigService;
  let config: ConfigType<typeof authRecoveryDefaultConfig>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthRecoveryAppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    authRecoveryService =
      moduleFixture.get<AuthRecoveryService>(AuthRecoveryService);
    otpService = moduleFixture.get<OtpService>(OtpService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    config = configService.get<AuthRecoverySettingsInterface>(
      AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN,
    ) as AuthRecoverySettingsInterface;

    Seeding.configure({
      dataSource: moduleFixture.get(getDataSourceToken()),
    });

    const userFactory = new UserFactory({
      entity: AuthRecoveryUserEntityFixture,
    });

    testUser = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('Recover login', async () => {
    expect(
      await authRecoveryService.recoverLogin(testUser.email),
    ).toBeUndefined();
  });

  it('Recover password', async () => {
    expect(
      await authRecoveryService.recoverPassword(testUser.email),
    ).toBeUndefined();
  });

  it('Validate passcode', async () => {
    const otp = await createOtp(config, otpService, testUser);

    const validOtp = await authRecoveryService.validatePasscode(otp.passcode);
    expect(validOtp?.assignee).toEqual(testUser);
  });

  it('Validate passcode (invalid)', async () => {
    const invalidOtp = await authRecoveryService.validatePasscode(
      'FAKE_PASSCODE',
    );

    expect(invalidOtp).toBeNull();
  });

  it('Update password', async () => {
    const otp = await createOtp(config, otpService, testUser);

    const user = await authRecoveryService.updatePassword(
      otp.passcode,
      '$!Abc123bsksl6764579',
    );

    expect(user?.id).toEqual(testUser.id);
  });

  it('Update password (fail)', async () => {
    const user = await authRecoveryService.updatePassword(
      'FAKE_PASSCODE',
      '$!Abc123bsksl6764579',
    );

    expect(user).toBeNull();
  });
});

const createOtp = async (
  config: ConfigType<typeof authRecoveryDefaultConfig>,
  otpService: OtpService,
  user: UserInterface,
): Promise<OtpInterface> => {
  const { category, assignment, type } = config.otp;

  return await otpService.create(assignment, {
    category,
    type,
    assignee: {
      id: user.id,
    },
  });
};
