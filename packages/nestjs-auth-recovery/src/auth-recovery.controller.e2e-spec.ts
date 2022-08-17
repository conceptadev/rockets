import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OtpInterface, UserInterface } from '@concepta/ts-common';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { EmailService } from '@concepta/nestjs-email';
import { OtpService } from '@concepta/nestjs-otp';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';

import { AUTH_RECOVERY_MODULE_SETTINGS_TOKEN } from './auth-recovery.constants';

import { AuthRecoveryController } from './auth-recovery.controller';
import { AuthRecoverySettingsInterface } from './interfaces/auth-recovery-settings.interface';
import { AuthRecoveryRecoverPasswordDto } from './dto/auth-recovery-recover-password.dto';
import { AuthRecoveryRecoverLoginDto } from './dto/auth-recovery-recover-login.dto';
import { AuthRecoveryUpdatePasswordDto } from './dto/auth-recovery-update-password.dto';

import { AuthRecoveryUserEntityFixture } from './__fixtures__/auth-recovery-user-entity.fixture';
import { AuthRecoveryAppModuleFixture } from './__fixtures__/auth-recovery.app.module.fixture';

describe(AuthRecoveryController, () => {
  let app: INestApplication;
  let otpService: OtpService;
  let settings: AuthRecoverySettingsInterface;
  let user: AuthRecoveryUserEntityFixture;
  let seedingSource: SeedingSource;
  let userFactory: UserFactory;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthRecoveryAppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    otpService = moduleFixture.get<OtpService>(OtpService);

    settings = moduleFixture.get<AuthRecoverySettingsInterface>(
      AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
    ) as AuthRecoverySettingsInterface;

    seedingSource = new SeedingSource({
      dataSource: moduleFixture.get(getDataSourceToken()),
    });

    userFactory = new UserFactory({
      entity: AuthRecoveryUserEntityFixture,
      seedingSource,
    });

    user = await userFactory.create();

    jest.spyOn(EmailService.prototype, 'sendMail').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('POST auth/recover-login', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/recovery/login')
      .send({ email: user.email } as AuthRecoveryRecoverLoginDto)
      .expect(201);
  });

  it('GET auth/recovery/passcode/{passcode}', async () => {
    const user = await getFirstUser(app);

    const otpCreateDto = await createOtp(settings, otpService, user.id);

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

    const otpCreateDto = await createOtp(settings, otpService, user.id);

    await supertest(app.getHttpServer())
      .patch('/auth/recovery/password')
      .send({
        passcode: otpCreateDto.passcode,
        newPassword: '$!Abc123bsksl6764579',
      } as AuthRecoveryUpdatePasswordDto)
      .expect(200);
  });
});

const getFirstUser = async (app: INestApplication): Promise<UserInterface> => {
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
  config: AuthRecoverySettingsInterface,
  otpService: OtpService,
  userId: string,
): Promise<OtpInterface> => {
  const { category, assignment, type, expiresIn } = config.otp;

  return await otpService.create(assignment, {
    category,
    type,
    expiresIn,
    assignee: {
      id: userId,
    },
  });
};
