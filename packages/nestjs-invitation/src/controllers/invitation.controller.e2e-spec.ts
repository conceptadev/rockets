import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { UserFactory } from '@concepta/nestjs-user/src/seeding';
import { ConfigService, ConfigType } from '@nestjs/config';
import { OtpService } from '@concepta/nestjs-otp';
import { OtpInterface, UserInterface } from '@concepta/ts-common';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EventDispatchService } from '@concepta/nestjs-event';

import { InvitationCreateDto } from '../dto/invitation-create.dto';
import { InvitationUserEntityFixture } from '../__fixtures__/invitation-user-entity.fixture';
import { InvitationAppModuleFixture } from '../__fixtures__/invitation.app.module.fixture';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationAcceptInviteDto } from '../dto/invitation-accept-invite.dto';
import { invitationDefaultConfig } from '../config/invitation-default.config';
import { InvitationFactory } from '../invitation.factory';
import { InvitationEntityFixture } from '../__fixtures__/invitation.entity.fixture';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';
import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from '../invitation.constants';

describe('InvitationController (e2e)', () => {
  const category = 'invitation';

  let app: INestApplication;
  let seedingSource: SeedingSource;
  let user: InvitationUserEntityFixture;
  let invitation: InvitationEntityInterface;
  let otpService: OtpService;
  let configService: ConfigService;
  let config: ConfigType<typeof invitationDefaultConfig>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
      providers: [
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            debug: jest.fn(async (arg1, arg2) => {
              return { arg1, arg2 };
            }),
          },
        },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

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

    user = await userFactory.create();
    invitation = await invitationFactory.create({ category });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  describe('Category: user', () => {
    it('POST invitation', async () => {
      await createInvite({ email: user.email, category });
    });

    it('PATCH invitation-acceptance', async () => {
      const { code } = invitation;

      const otp = await createOtp(config, otpService, user, category);

      const { passcode } = otp;

      await supertest(app.getHttpServer())
        .patch(`/invitation-acceptance/${code}`)
        .send({
          passcode,
          payload: { dummyData: {} },
        } as InvitationAcceptInviteDto)
        .expect(200);
    });

    it('GET invitation-acceptance', async () => {
      const { code } = invitation;

      const otp = await createOtp(config, otpService, user, category);

      const { passcode } = otp;

      await supertest(app.getHttpServer())
        .get(`/invitation-acceptance/${code}?passcode=${passcode}`)
        .expect(200);
    });

    it('GET invitation', async () => {
      const invitationCreateDto = {
        email: user.email,
        category,
      } as InvitationCreateDto;
      const invite1 = await createInvite(invitationCreateDto);
      const invite2 = await createInvite(invitationCreateDto);
      const invite3 = await createInvite(invitationCreateDto);

      const response = await supertest(app.getHttpServer())
        .get(`/invitation?s={"email": "${invitationCreateDto.email}"}`)
        .expect(200);

      const invitationResponse = response.body as InvitationDto[];

      expect(invitationResponse.length).toEqual(3);

      const inviteResponse1 = {
        ...invitationResponse[0],
        audit: invite1.audit,
      };
      const inviteResponse2 = {
        ...invitationResponse[1],
        audit: invite2.audit,
      };
      const inviteResponse3 = {
        ...invitationResponse[2],
        audit: invite3.audit,
      };

      expect(invite1).toEqual(inviteResponse1);
      expect(invite2).toEqual(inviteResponse2);
      expect(invite3).toEqual(inviteResponse3);
    });

    it('GET invitation/:id', async () => {
      const invitation = await createInvite({ email: user.email, category });

      const response = await supertest(app.getHttpServer())
        .get(`/invitation/${invitation.id}`)
        .expect(200);

      const invitationResponse = response.body as InvitationDto;
      invitation.audit = invitationResponse.audit;

      expect(invitation).toEqual(invitationResponse);
    });

    it('DELETE invitation/:id', async () => {
      const invitation = await createInvite({ email: user.email, category });

      await supertest(app.getHttpServer())
        .delete(`/invitation/${invitation.id}`)
        .expect(200);

      await supertest(app.getHttpServer())
        .get(`/invitation/${invitation.id}`)
        .expect(404);
    });

    const createInvite = async (
      invitationCreateDto: InvitationCreateDto,
    ): Promise<InvitationDto> => {
      const response = await supertest(app.getHttpServer())
        .post('/invitation')
        .send(invitationCreateDto)
        .expect(201);

      return response.body as InvitationDto;
    };
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
