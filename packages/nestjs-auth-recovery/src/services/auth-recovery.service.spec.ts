import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';

import { AuthRecoveryService } from './auth-recovery.service';
import { AuthRecoveryAppModuleFixture } from '../__fixtures__/auth-recovery.app.module.fixture';
import { AuthRecoveryUserEntityFixture } from '../__fixtures__/auth-recovery-user-entity.fixture';
import { UserFactoryFixture } from '../__fixtures__/factories/user.factory.fixture';
import { ConfigService, ConfigType } from '@nestjs/config';
import { authRecoveryDefaultConfig } from '../config/auth-recovery-default.config';
import { OtpService } from '@concepta/nestjs-otp';
import { OtpInterface } from '@concepta/ts-common';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { AuthRecoverySettingsInterface } from '../interfaces/auth-recovery-settings.interface';
import { AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-recovery.constants';

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

    UserFactory.entity = AuthRecoveryUserEntityFixture;

    await useSeeders([], { root: __dirname, connection: 'default' });

    const userFactory = new UserFactoryFixture();
    testUser = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('Recover login', async () => {
    await authRecoveryService.recoverLogin(testUser.email);
  });

  it('Recover password', async () => {
    await authRecoveryService.recoverPassword(testUser.email);
  });

  it('Validate passcode', async () => {
    const otpCreateDto = await createOtp(config, otpService, testUser.id);

    const { passcode } = otpCreateDto;
    await authRecoveryService.validatePasscode(passcode);
  });

  it('Update password', async () => {
    const otpCreateDto = await createOtp(config, otpService, testUser.id);

    const { passcode } = otpCreateDto;
    await authRecoveryService.updatePassword(passcode, '$!Abc123bsksl6764579');
  });
});

const createOtp = async (
  config: ConfigType<typeof authRecoveryDefaultConfig>,
  otpService: OtpService,
  userId: string,
): Promise<OtpInterface> => {
  const { category, assignment, type } = config.otp;

  return await otpService.create(assignment, {
    category,
    type,
    assignee: {
      id: userId,
    },
  });
};
