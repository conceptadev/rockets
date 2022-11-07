import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { INVITATION_MODULE_CATEGORY_ORG_KEY } from '@concepta/ts-common';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { EventDispatchService, EventModule } from '@concepta/nestjs-event';
import { UserEntityInterface, UserModule } from '@concepta/nestjs-user';
import { getDataSourceToken } from '@nestjs/typeorm';
import { InvitationEntityInterface } from '@concepta/nestjs-invitation/src/interfaces/invitation.entity.interface';
import { UserFactory } from '@concepta/nestjs-user/src/user.factory';
import { InvitationFactory } from '@concepta/nestjs-invitation/src/invitation.factory';

import { InvitationAcceptedListener } from './invitation-accepted-listener';
import { OrgEntityFixture } from '../__fixtures__/org-entity.fixture';
import { OwnerEntityFixture } from '../__fixtures__/owner-entity.fixture';
import { OrgMemberEntityFixture } from '../__fixtures__/org-member.entity.fixture';
import { UserEntityFixture } from '../__fixtures__/user-entity.fixture';
import { OrgModule } from '../org.module';
import { OwnerLookupServiceFixture } from '../__fixtures__/owner-lookup-service.fixture';
import { OwnerModuleFixture } from '../__fixtures__/owner.module.fixture';
import { InvitationAcceptedEventAsync } from '../__fixtures__/invitation-accepted.event';
import { InvitationEntityFixture } from '../__fixtures__/invitation.entity.fixture';
import { OrgFactory } from '../seeding/org.factory';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';
import { OwnerFactoryFixture } from '../__fixtures__/owner-factory.fixture';

describe(InvitationAcceptedListener, () => {
  const category = INVITATION_MODULE_CATEGORY_ORG_KEY;
  let app: INestApplication;
  let eventDispatchService: EventDispatchService;
  let seedingSource: SeedingSource;
  let testUser: UserEntityInterface;
  let testOwner: OwnerEntityFixture;
  let testOrg: OrgEntityInterface;
  let testInvitation: InvitationEntityInterface;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [
        EventModule.forRoot({}),
        TypeOrmExtModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          logging: 'all',
          synchronize: true,
          entities: [
            OrgEntityFixture,
            OwnerEntityFixture,
            OrgMemberEntityFixture,
            UserEntityFixture,
            InvitationEntityFixture,
          ],
        }),
        UserModule.forRoot({
          entities: {
            user: {
              entity: UserEntityFixture,
            },
          },
        }),
        OrgModule.forRootAsync({
          inject: [OwnerLookupServiceFixture],
          useFactory: (ownerLookupService: OwnerLookupServiceFixture) => ({
            ownerLookupService,
            settings: {
              invitationRequestEvent: InvitationAcceptedEventAsync,
            },
          }),
          entities: {
            org: {
              entity: OrgEntityFixture,
            },
            orgMember: {
              entity: OrgMemberEntityFixture,
            },
          },
        }),
        CrudModule.forRoot({}),
        OwnerModuleFixture.register(),
      ],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();

    eventDispatchService =
      testingModule.get<EventDispatchService>(EventDispatchService);

    seedingSource = new SeedingSource({
      dataSource: testingModule.get(getDataSourceToken()),
    });

    const orgFactory = new OrgFactory({
      entity: OrgEntityFixture,
      seedingSource,
    });

    const userFactory = new UserFactory({
      entity: UserEntityFixture,
      seedingSource,
    });
    const ownerFactory = new OwnerFactoryFixture({
      entity: OwnerEntityFixture,
      seedingSource,
    });

    const invitationFactory = new InvitationFactory({
      entity: InvitationEntityFixture,
      seedingSource,
    });

    testUser = await userFactory.create();
    testOwner = await ownerFactory.create();
    testOrg = await orgFactory.create({
      owner: testOwner,
    });
    testInvitation = await invitationFactory.create({
      user: testUser,
      category,
      constraints: { orgId: testOrg.id },
    });
  });

  it('event should be listened', async () => {
    const invitationAcceptedEventAsync = new InvitationAcceptedEventAsync({
      ...testInvitation,
      data: {
        userId: testInvitation.user.id,
      },
    });

    const eventResult = await eventDispatchService.async(
      invitationAcceptedEventAsync,
    );

    const result = eventResult.some((it) => it === true);

    expect(result);
  });
});
