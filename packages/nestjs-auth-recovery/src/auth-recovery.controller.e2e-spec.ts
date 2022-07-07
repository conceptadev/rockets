import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';

import { AuthRecoveryAppModuleFixture } from './__fixtures__/auth-recovery.app.module.fixture';
import { AuthRecoveryRecoverPasswordDto } from './dto/auth-recovery-recover-password.dto';
import { UserDto } from '@concepta/nestjs-user/dist/dto/user.dto';
import { AuthRecoveryRecoverLoginDto } from './dto/auth-recovery-recover-login.dto';
import { AuthRecoveryUpdatePasswordDto } from './dto/auth-recovery-update-password.dto';
import { OtpService } from '@concepta/nestjs-otp';
import { authRecoveryDefaultConfig } from './config/auth-recovery-default.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN } from './auth-recovery.constants';
import { AuthRecoverySettingsInterface } from './interfaces/auth-recovery-settings.interface';
import { OtpInterface, UserInterface } from '@concepta/ts-common';
import { Seeding } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AuthRecoveryUserEntityFixture } from './__fixtures__/auth-recovery-user-entity.fixture';

describe('AuthRecoveryController (e2e)', () => {
  let app: INestApplication;
  let otpService: OtpService;
  let configService: ConfigService;
  let config: ConfigType<typeof authRecoveryDefaultConfig>;
  let user: AuthRecoveryUserEntityFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthRecoveryAppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

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

    user = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('POST auth/recover-login', async () => {
    // const user = await getFirstUser(app);

    await supertest(app.getHttpServer())
      .post('/auth/recovery/login')
      .send({ email: user.email } as AuthRecoveryRecoverLoginDto)
      .expect(201);
  });

  it('GET auth/recovery/passcode/{passcode}', async () => {
    const user = await getFirstUser(app);

    const otpCreateDto = await createOtp(config, otpService, user.id);

    const { passcode } = otpCreateDto;

    await supertest(app.getHttpServer())
      .get(`/auth/recovery/passcode/${passcode}`)
      .expect(200);

    await validateRecoverPassword(app, user);
  });

  it('POST auth/recovery/password', async () => {
    const user = await getFirstUser(app);

    await validateRecoverPassword(app, user);
  });

  it('PATCH auth/recovery/password', async () => {
    const user = await getFirstUser(app);

    await validateRecoverPassword(app, user);

    const otpCreateDto = await createOtp(config, otpService, user.id);

    await supertest(app.getHttpServer())
      .patch('/auth/recovery/password')
      .send({
        passcode: otpCreateDto.passcode,
        newPassword: '$!Abc123bsksl6764579',
      } as AuthRecoveryUpdatePasswordDto)
      .expect(200);
  });
});

const getFirstUser = async (app: INestApplication): Promise<UserDto> => {
  const response = await supertest(app.getHttpServer())
    .get('/user?limit=1')
    .expect(200);

  return response?.body[0];
};

const validateRecoverPassword = async (
  app: INestApplication,
  user: UserInterface,
): Promise<void> => {
  await supertest(app.getHttpServer())
    .post('/auth/recovery/password')
    .send({ email: user.email } as AuthRecoveryRecoverPasswordDto)
    .expect(201);
};

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
