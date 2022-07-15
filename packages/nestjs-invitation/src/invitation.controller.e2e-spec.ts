import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OtpInterface } from '@concepta/ts-common';
import { Seeding } from '@concepta/typeorm-seeding';
import { OtpService } from '@concepta/nestjs-otp';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';

import { InvitationDto } from './dto/invitation.dto';
import { invitationDefaultConfig } from './config/invitation-default.config';
import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from './invitation.constants';
import { InvitationSettingsInterface } from './interfaces/invitation-settings.interface';

import { InvitationUserEntityFixture } from './__fixtures__/invitation-user-entity.fixture';
import { InvitationAppModuleFixture } from './__fixtures__/invitation.app.module.fixture';
import { InvitationAcceptInviteDto } from './dto/invitation-accept-invite.dto';

describe('AuthRecoveryController (e2e)', () => {
  let app: INestApplication;
  let otpService: OtpService;
  let configService: ConfigService;
  let config: ConfigType<typeof invitationDefaultConfig>;
  let user: InvitationUserEntityFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

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

    user = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('POST invitation/invite', async () => {
    await supertest(app.getHttpServer())
      .post('/invitation/invite')
      .send({ email: user.email } as InvitationDto)
      .expect(201);
  });

  it('GET invitation/passcode/{passcode}', async () => {
    const otpCreateDto = await createOtp(config, otpService, user.id);

    const { passcode } = otpCreateDto;

    await supertest(app.getHttpServer())
      .get(`/invitation/passcode/${passcode}`)
      .expect(200);
  });

  it('PATCH invitation/invite', async () => {
    const otpCreateDto = await createOtp(config, otpService, user.id);

    await supertest(app.getHttpServer())
      .patch('/invitation/invite')
      .send({
        passcode: otpCreateDto.passcode,
        newPassword: '$!Abc123bsksl6764579',
      } as InvitationAcceptInviteDto)
      .expect(200);
  });

  it('DELETE invitation/invite', async () => {
    await createOtp(config, otpService, user.id);

    await supertest(app.getHttpServer())
      .delete('/invitation/invite')
      .send({ email: user.email } as InvitationDto)
      .expect(200);
  });
});

const createOtp = async (
  config: ConfigType<typeof invitationDefaultConfig>,
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
