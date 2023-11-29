import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';
import { ConfigService, ConfigType } from '@nestjs/config';
import { OtpService } from '@concepta/nestjs-otp';
import {
  INVITATION_MODULE_CATEGORY_ORG_KEY,
  INVITATION_MODULE_CATEGORY_USER_KEY,
  OtpInterface,
  UserInterface,
} from '@concepta/ts-common';
import { EmailService } from '@concepta/nestjs-email';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';

import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from '../invitation.constants';
import { InvitationCreateDto } from '../dto/invitation-create.dto';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationAcceptInviteDto } from '../dto/invitation-accept-invite.dto';
import { invitationDefaultConfig } from '../config/invitation-default.config';
import { InvitationFactory } from '../invitation.factory';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { InvitationEntityFixture } from '../__fixtures__/invitation/entities/invitation.entity.fixture';
import { UserEntityFixture } from '../__fixtures__/user/entities/user-entity.fixture';

describe('InvitationController (e2e)', () => {
  const userCategory = INVITATION_MODULE_CATEGORY_USER_KEY;
  const orgCategory = INVITATION_MODULE_CATEGORY_ORG_KEY;
  const payload = { moreData: 'foo' };

  let app: INestApplication;
  let invitationFactory: InvitationFactory;
  let seedingSource: SeedingSource;
  let user: UserEntityFixture;
  let otpService: OtpService;
  let configService: ConfigService;
  let config: ConfigType<typeof invitationDefaultConfig>;

  beforeEach(async () => {
    jest
      .spyOn(EmailService.prototype, 'sendMail')
      .mockImplementation(async () => undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    otpService = moduleFixture.get<OtpService>(OtpService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    config = configService.get<InvitationSettingsInterface>(
      INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN,
    ) as InvitationSettingsInterface;

    seedingSource = new SeedingSource({
      dataSource: moduleFixture.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    const userFactory = new UserFactory({
      entity: UserEntityFixture,
      seedingSource,
    });

    invitationFactory = new InvitationFactory({
      entity: InvitationEntityFixture,
      seedingSource,
    });

    user = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  describe('Type: org', () => {
    let invitation: InvitationEntityInterface;

    beforeEach(async () => {
      invitation = await invitationFactory.create({
        category: orgCategory,
        user,
      });
    });

    it('POST invitation', async () => {
      await createInvite(app, {
        email: user.email,
        category: orgCategory,
        payload,
      });
    });

    it('PATCH invitation-acceptance', async () => {
      const { code } = invitation;

      const otp = await createOtp(config, otpService, user, orgCategory);

      const { passcode } = otp;

      await supertest(app.getHttpServer())
        .patch(`/invitation-acceptance/${code}`)
        .send({
          passcode,
          payload: { newPassword: 'hOdv2A2h%' },
        } as InvitationAcceptInviteDto)
        .expect(200);
    });
  });

  describe('Type: user', () => {
    let invitation: InvitationEntityInterface;

    beforeEach(async () => {
      invitation = await invitationFactory.create({
        category: userCategory,
        user,
      });
    });

    it('POST invitation', async () => {
      await createInvite(app, {
        email: user.email,
        category: userCategory,
        payload,
      });
    });

    it('POST invitation (create new user)', async () => {
      await createInvite(app, {
        email: 'test@mail.com',
        category: userCategory,
        payload,
      });
    });

    it('POST invitation reattempt', async () => {
      const invitationDto = await createInvite(app, {
        email: 'test@mail.com',
        category: userCategory,
        payload,
      });

      await supertest(app.getHttpServer())
        .post(`/invitation-reattempt/${invitationDto.code}`)
        .expect(201);
    });

    it('PATCH invitation-acceptance', async () => {
      const { code } = invitation;

      const otp = await createOtp(config, otpService, user, userCategory);

      const { passcode } = otp;

      await supertest(app.getHttpServer())
        .patch(`/invitation-acceptance/${code}`)
        .send({
          passcode,
          payload: { newPassword: 'hOdv2A2h%' },
        } as InvitationAcceptInviteDto)
        .expect(200);
    });

    it('GET invitation-acceptance', async () => {
      const { code } = invitation;

      const otp = await createOtp(config, otpService, user, userCategory);

      const { passcode } = otp;

      await supertest(app.getHttpServer())
        .get(`/invitation-acceptance/${code}?passcode=${passcode}`)
        .expect(200);
    });

    it('GET invitation', async () => {
      const invitationCreateDto = {
        email: user.email,
        category: userCategory,
        payload,
      } as InvitationCreateDto;
      const invite1 = await createInvite(app, invitationCreateDto);
      const invite2 = await createInvite(app, invitationCreateDto);
      const invite3 = await createInvite(app, invitationCreateDto);

      const response = await supertest(app.getHttpServer())
        .get(`/invitation?s={"email": "${invitationCreateDto.email}"}`)
        .expect(200);

      const invitationResponse = response.body as InvitationDto[];

      expect(invitationResponse.length).toEqual(3);

      expect(invite1).toEqual(invitationResponse[0]);
      expect(invite2).toEqual(invitationResponse[1]);
      expect(invite3).toEqual(invitationResponse[2]);
    });

    it('GET invitation/:id', async () => {
      const invitation = await createInvite(app, {
        email: user.email,
        category: userCategory,
        payload,
      });

      const response = await supertest(app.getHttpServer())
        .get(`/invitation/${invitation.id}`)
        .expect(200);

      const invitationResponse = response.body as InvitationDto;

      expect(invitation).toEqual(invitationResponse);
    });

    it('DELETE invitation/:id', async () => {
      const invitation = await createInvite(app, {
        email: user.email,
        category: userCategory,
        payload,
      });

      await supertest(app.getHttpServer())
        .delete(`/invitation/${invitation.id}`)
        .expect(200);

      await supertest(app.getHttpServer())
        .get(`/invitation/${invitation.id}`)
        .expect(404);
    });
  });
});

const createInvite = async (
  app: INestApplication,
  invitationCreateDto: InvitationCreateDto,
): Promise<InvitationDto> => {
  const response = await supertest(app.getHttpServer())
    .post('/invitation')
    .send(invitationCreateDto)
    .expect(201);

  return response.body as InvitationDto;
};

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
