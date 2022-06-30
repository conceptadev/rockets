import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { UserFactory, UserSeeder } from '@concepta/nestjs-user/src/seeding';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserEntityFixture } from './__fixtures__/user-entity.fixture';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { UserDto } from '@concepta/nestjs-user/dist/dto/user.dto';
import { RecoverLoginDto } from './dto/recover-login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { OtpService } from '@concepta/nestjs-otp';
import { authRecoveryDefaultConfig } from './config/auth-recovery-default.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN } from './auth-recovery.constants';
import { AuthRecoverySettingsInterface } from './interfaces/auth-recovery-settings.interface';
import { UserInterface } from '@concepta/ts-common';

describe('AuthRecoveryController (e2e)', () => {
  describe('AuthRecovery', () => {
    let app: INestApplication;
    let otpService: OtpService;
    let configService: ConfigService;
    let config: ConfigType<typeof authRecoveryDefaultConfig>;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModuleFixture],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      otpService = moduleFixture.get<OtpService>(OtpService);
      configService = moduleFixture.get<ConfigService>(ConfigService);

      config = configService.get<AuthRecoverySettingsInterface>(
        AUTH_RECOVERY_MODULE_DEFAULT_SETTINGS_TOKEN,
      ) as AuthRecoverySettingsInterface;

      UserFactory.entity = UserEntityFixture;

      await useSeeders(UserSeeder, { root: __dirname, connection: 'default' });
    });

    afterEach(async () => {
      jest.clearAllMocks();
      return app ? await app.close() : undefined;
    });

    it('POST auth/recover-login', async () => {
      const user = await getFirstUser(app);

      await supertest(app.getHttpServer())
        .post('/auth/recover-login')
        .send({ email: user.email } as RecoverLoginDto)
        .expect(201);
    });

    it('POST auth/recover-password', async () => {
      const user = await getFirstUser(app);

      await validateRecoverPassword(app, user);
    });

    it('POST auth/update-password', async () => {
      const user = await getFirstUser(app);

      await validateRecoverPassword(app, user);

      const { id } = user;
      const { category, assignment, type } = config.otp;
      const otpCreateDto = await otpService.create(assignment, {
        category,
        type,
        assignee: {
          id,
        },
      });

      await supertest(app.getHttpServer())
        .post('/auth/update-password')
        .send({
          passcode: otpCreateDto.passcode,
          newPassword: '$!Abc123bsksl6764579',
        } as UpdatePasswordDto)
        .expect(201);
    });
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
    .post('/auth/recover-password')
    .send({ email: user.email } as RecoverPasswordDto)
    .expect(201);
};
