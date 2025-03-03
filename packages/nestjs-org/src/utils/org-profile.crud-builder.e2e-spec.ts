import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { OrgFactory } from '../seeding/org.factory';
import { OrgModule } from '../org.module';
import { OrgEntityFixture } from '../__fixtures__/org-entity.fixture';
import { OwnerEntityFixture } from '../__fixtures__/owner-entity.fixture';
import { OwnerLookupServiceFixture } from '../__fixtures__/owner-lookup-service.fixture';
import { OwnerModuleFixture } from '../__fixtures__/owner.module.fixture';
import { OwnerFactoryFixture } from '../__fixtures__/owner-factory.fixture';
import { OrgMemberEntityFixture } from '../__fixtures__/org-member.entity.fixture';
import { UserEntityFixture } from '../__fixtures__/user-entity.fixture';
import { InvitationEntityFixture } from '../__fixtures__/invitation.entity.fixture';
import { OrgProfileEntityFixture } from '../__fixtures__/org-profile.entity.fixture';
import { OrgProfileFactory } from '../seeding/org-profile.factory';
import { OrgProfileSeeder } from '../seeding/org-profile.seeder';
import { OrgProfileCrudBuilder } from './org-profile.crud-builder';

describe('Org Profile Crud Builder (e2e)', () => {
  let app: INestApplication;
  let seedingSource: SeedingSource;

  const orgFactory = new OrgFactory({
    entity: OrgEntityFixture,
    factories: [new OwnerFactoryFixture()],
  });

  const orgProfileFactory = new OrgProfileFactory({
    entity: OrgProfileEntityFixture,
    factories: [orgFactory],
  });

  const orgProfileCrudBuilder = new OrgProfileCrudBuilder();
  const { ConfigurableControllerClass, ConfigurableServiceProvider } =
    orgProfileCrudBuilder.build();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [
            OrgEntityFixture,
            OrgProfileEntityFixture,
            OwnerEntityFixture,
            OrgMemberEntityFixture,
            UserEntityFixture,
            InvitationEntityFixture,
          ],
        }),
        OrgModule.registerAsync({
          inject: [OwnerLookupServiceFixture],
          useFactory: (ownerLookupService: OwnerLookupServiceFixture) => ({
            ownerLookupService,
          }),
          entities: {
            org: {
              entity: OrgEntityFixture,
            },
            'org-member': {
              entity: OrgMemberEntityFixture,
            },
            'org-profile': {
              entity: OrgProfileEntityFixture,
            },
          },
          extraControllers: [ConfigurableControllerClass],
          extraProviders: [ConfigurableServiceProvider],
        }),
        CrudModule.forRoot({}),
        OwnerModuleFixture.register(),
      ],
      providers: [OwnerLookupServiceFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    const orgProfileSeeder = new OrgProfileSeeder({
      factories: [orgProfileFactory],
    });

    await seedingSource.run.one(orgProfileSeeder);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('GET /org-profile', async () => {
    const response = await supertest(app.getHttpServer())
      .get('/org-profile?limit=10')
      .expect(200)
      .expect((res) => res.body.length === 10);
    expect(response);
  });

  it('GET /org-profile/:id', async () => {
    // get an org so we have an id
    const response = await supertest(app.getHttpServer())
      .get('/org-profile?limit=1')
      .expect(200);

    // get one using that id
    await supertest(app.getHttpServer())
      .get(`/org-profile/${response.body[0].id}`)
      .expect(200);
  });

  it('POST /org-profile', async () => {
    // need an org
    const org = await orgFactory.create();

    await supertest(app.getHttpServer())
      .post('/org-profile')
      .send({ orgId: org.id })
      .expect(201);
  });

  it('DELETE /org-profile/:id', async () => {
    // get an org so we have an id
    const response = await supertest(app.getHttpServer())
      .get('/org-profile?limit=1')
      .expect(200);

    // delete one using that id
    await supertest(app.getHttpServer())
      .delete(`/org-profile/${response.body[0].id}`)
      .expect(200);
  });
});
